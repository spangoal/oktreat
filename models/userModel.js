const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
        },
        gender: String,
        email: {
            type: String,
            // required: [true, 'Please enter your email.'],
            unique: true,
            lowerCase: true,
            validate: [validator.isEmail, 'Please enter a valid email.'],
        },
        phone: String,
        about: String,
        skills: String,
        profilePic: {
            type: String,
            default: 'profile/default.png',
        },
        document: {
            type: String,
        },
        UDID: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        role: {
            type: String,
            default: 'user',
            enum: ['user'],
        },
        address: { type: String, trim: true, lowercase: true },
        location: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
        },
        deviceType: { type: String, select: false },
        deviceToken: { type: String, select: false },
        password: {
            type: String,
            select: false,
            minlength: 8,
            maxlength: 20,
        },
        passwordConfirm: {
            type: String,
            validate: {
                validator: function (el) {
                    return el === this.password;
                },
                message: 'Passwords are not the same!',
            },
        },
        passwordChangedAT: { type: Date, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password' || this.isNew)) return next();

    this.passwordChangedAT = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAT) {
        const changedTimeStamp = parseInt(this.passwordChangedAT.getTime() / 1000, 10);

        return JWTTimeStamp < changedTimeStamp;
    }

    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
