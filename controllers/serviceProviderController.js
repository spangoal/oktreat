const crypto = require('crypto');
const util = require('util');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const path = require('path');
const ServiceProvider = require('../models/serviceProviderModel');
const Subscription = require('../models/subscriptionModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendForgotPasswordEmail, sendAccountDeletedEmail } = require('../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        // expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, phone, role, profilePic, document, address, coordinates, passwordConfirm, password } =
        req.body;

    if (!email || !password) return next(new AppError('Please Provide Email and Password', 400));

    const user = await ServiceProvider.findOne({ email: email.toLowerCase() });
    if (user) return next(new AppError('User already exists', 400));

    const newUser = await ServiceProvider.create({
        name,
        email: email.toLowerCase(),
        phone,
        address,
        location: { type: 'Point', coordinates },
        role,
        profilePic,
        document,
        password,
        passwordConfirm,
    });

    createSendToken(newUser, 201, res);
});

exports.update = catchAsync(async (req, res, next) => {
    const { profilePic } = req.body;
    let user = await ServiceProvider.findByIdAndUpdate(
        req.user.id,
        {
            ...req.body,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user) return next(new AppError('No User found with that ID', 404));

    res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: { user },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password, role, deviceType, deviceToken } = req.body;

    if (!email || !password) return next(new AppError('Please Provide Email and Password', 400));

    let filter = { email: email.toLowerCase() };

    if (role) filter.role = role;

    let user = await ServiceProvider.findOne(filter).select('+password');

    if (!user || !user.password || !(await user.correctPassword(password, user.password)))
        return next(new AppError('Incorrect Email or Password', 401));

    if (!user.isActive) return next(new AppError('Your account is blocked.', 403));

    if (deviceToken) {
        user = await ServiceProvider.findByIdAndUpdate(
            user.id,
            { deviceType: deviceType, deviceToken: deviceToken },
            {
                new: true,
                runValidators: true,
            }
        );
    }

    createSendToken(user, 200, res);
});

exports.socialLogin = catchAsync(async (req, res, next) => {
    console.log('req.body social', req.body);
    const { name, email, phone, deviceType, deviceToken } = req.body;

    if (!email && !phone) return next(new AppError('Please Provide Email or Phone', 400));

    let user;
    if (email) user = await ServiceProvider.findOne({ email: email.toLowerCase() });
    else if (phone) user = await User.findOne({ phone: phone });

    if (!user) {
        user = await ServiceProvider.create({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            role: req.body.role,
            coachCategory: req.body.coachCategory,
        });
    }

    if (!user.isActive) return next(new AppError('Your account is blocked.', 403));

    if (deviceToken) {
        user = await ServiceProvider.findByIdAndUpdate(
            user.id,
            { deviceType: deviceType, deviceToken: deviceToken },
            {
                new: true,
                runValidators: true,
            }
        );
    }

    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError('You are not logged in! Please login to get access!', 401));

    const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await ServiceProvider.findById(decoded.id);
    if (!currentUser) return next(new AppError('The User belonging to this token does not exist', 401));

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please login again.', 401));
    }

    req.user = currentUser;
    next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const email = req.body.email;
    if (!email) return next(new AppError('Please Enter your Email.', 400));

    const user = await ServiceProvider.findOne({ email });
    if (!user) return next(new AppError('There is no user with email address.', 404));

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.WEB_BASE_URL}/reset-password/${resetToken}`;

    await sendForgotPasswordEmail(user, resetUrl);

    res.status(200).json({
        status: 'success',
        message: 'Password reset mail sent successfully.',
    });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hasedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await ServiceProvider.findOne({
        passwordResetToken: hasedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Token is invalid or expired.', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, password, passwordConfirm } = req.body;

    if (!oldPassword || !password || !passwordConfirm)
        return next(new AppError('Please Provide Old Password, Password and Confirm Password', 400));

    let user = await ServiceProvider.findOne({ _id: req.user.id }).select('+password');
    if (!user) return next(new AppError('No User found with that ID', 404));

    if (!user || !user.password || !(await user.correctPassword(oldPassword, user.password)))
        return next(new AppError('Incorrect Old Password', 401));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    await user.save();

    createSendToken(user, 200, res);
});

exports.profile = catchAsync(async (req, res, next) => {
    const user = await ServiceProvider.findById(req.user.id).lean();

    if (!user) return next(new AppError('No User found with that ID', 404));

    const subscription = await Subscription.findOne({ userId: req.user.id })
        .select('userId validTill')
        .populate('subscriptionPlanId', 'name icon')
        .lean();

    if (subscription) {
        user.subscription = subscription;
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.updateUDID = catchAsync(async (req, res, next) => {
    const user = await ServiceProvider.findByIdAndUpdate(
        req.user.id,
        { UDID: req.body.UDID },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user) return next(new AppError('No User found with that ID', 404));

    res.status(200).json({
        status: 'success',
        message: 'UDID updated successfully.',
    });
});

exports.deleteDeviceToken = catchAsync(async (req, res, next) => {
    const user = await ServiceProvider.findByIdAndUpdate(
        req.user.id,
        { deviceType: '', deviceToken: '' },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user) return next(new AppError('No User found with that ID', 404));

    res.status(200).json({
        status: 'success',
        message: 'Device Token deleted successfully.',
    });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
    const user = await ServiceProvider.findById(req.user.id).lean();

    if (!user) return next(new AppError('No User found with that ID', 404));

    // await User.findOneAndDelete({ _id: req.user.id });
    await User.findByIdAndUpdate(
        req.user.id,
        {
            isDeleted: true,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    await sendAccountDeletedEmail(user);

    res.status(200).json({
        status: 'success',
        message: 'Account deleted successfully',
    });
});

exports.getAllUser = catchAsync(async (req, res, next) => {
    const filter = { role: 'user', isDeleted: { $ne: true } };

    if (req.query.search) {
        filter.name = {
            $regex: req.query.search,
            $options: 'i',
        };
    }

    let query = ServiceProvider.find(filter)
        .sort('-createdAt')
        .select('name email phone profilePic coachCategory coachRating');

    let page = req.query.page ? parseInt(req.query.page) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 0;
    if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
    }

    const users = await query;
    const totalCount = await ServiceProvider.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        total: totalCount,
        results: users.length,
        data: {
            users,
        },
    });
});

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await ServiceProvider.findById(req.params.id).select('+coachRating');

    if (!user) return next(new AppError('No user found with that ID', 404));

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return next(new AppError('You do not have permission to perform this action!', 403));

        next();
    };
};
