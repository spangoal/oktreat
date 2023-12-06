const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const Product = require("../models/productModel");
const catchAsync = require("../utils/catchAsync");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllProduct = catchAsync(async (req, res, next) => {
  const filter = { isDeleted: { $ne : true } };

  if (req.query.search) {
    filter.name = {
      $regex: req.query.search,
      $options: "i",
    };
  }

  let query = Product.find(filter).sort("-createdAt");

  let page = req.query.page ? parseInt(req.query.page) : 0;
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  if (page && limit) {
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const products = await query;
  const totalCount = await Product.countDocuments(filter);

  res.status(200).json({
    status: "success",
    total: totalCount,
    results: products.length,
    data: {
      products,
    },
  });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const { name, images, price, description, stock } = req.body;

  if (!name || !price || !stock)
    return next(new AppError("Please provide Name, Price and Stock", 400));

  const existingProduct = await Product.findOne({ name });

  if (existingProduct)
    return next(new AppError(`Product with name ${name} already exists`, 400));

  const newProduct = await Product.create({
    name,
    images,
    price,
    description,
    stock,
  });

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    data: {
      Product: newProduct,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const { name, images, price, description, stock } = req.body;
  let updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      images,
      price,
      description,
      stock,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedProduct)
    return next(new AppError("No Product found with that ID", 404));

  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: { Product: updatedProduct },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      isDeleted: true
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) return next(new AppError("No Product found with that ID", 404));

  res.status(204).json({
    status: "success",
    data: null,
  });
});
