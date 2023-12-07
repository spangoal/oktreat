const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const Services = require('../models/servicesModel');
const Subscription = require('../models/subscriptionModel');
const catchAsync = require('../utils/catchAsync');
const ObjectId = mongoose.Types.ObjectId;

exports.getAllServices = catchAsync(async (req, res, next) => {
    const filter = {};

    if (req.query.name) {
        filter.name = req.query.name;
    }

    let query = Services.find(filter).sort('-createdAt');

    let page = req.query.page ? parseInt(req.query.page) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 0;
    if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
    }

    const services = await query;
    const totalCount = await Services.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        total: totalCount,
        results: services.length,
        data: {
            services,
        },
    });
});

exports.getService = catchAsync(async (req, res, next) => {
    const service = await Services.findById(req.params.id);

    if (!service) return next(new AppError('No Service found with that ID', 404));

    res.status(200).json({
        status: 'success',
        data: {
            service,
        },
    });
});

exports.createServices = catchAsync(async (req, res, next) => {
    const { name } = req.body;

    let service = await Services.findOne({ name });
    if (service) return next(new AppError('Service already exists', 400));

    service = await Services.create({ ...req.body, type: name.toLowerCase().split(' ').join('_') });

    res.status(201).json({
        status: 'success',
        message: 'Service created successfully',
        data: {
            service,
        },
    });
});

exports.deleteService = catchAsync(async (req, res, next) => {
    const service = await Services.findById(req.params.id).lean();
    if (!service) return next(new AppError('No Service found with that ID', 404));

    await Services.findByIdAndUpdate(
        req.params.id,
        {
            isDeleted: true,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'success',
        message: 'Service deleted successfully',
    });
});
