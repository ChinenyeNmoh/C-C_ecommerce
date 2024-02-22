const Product = require('../models/product');
const User = require('../models/user');
const ProductType = require('../models/productType');

// create productType
const createType = async (req, res) => {
  try {
    const newType = await ProductType.findOne({ title: req.body.title });

    if (newType) {
      return res.status(400).json({ message: `${req.body.title} type has already exist` });
    } else {
      const type = await ProductType.create(req.body);

      return res.status(200).json({
        message: `${req.body.title} type created`,
        data: type,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// update productType
const updateType = async (req, res) => {
  const { id } = req.params;

  try {
    const type = await ProductType.findById(id);

    if (!type) {
      return res.status(404).json({
        message: "Product type not found",
      });
    } else {
      const updatedtype = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return res.status(200).json({
        message: "Product type updated successfully",
        data: updatedtype,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// delete a product type
const deleteType = async (req, res) => {
  const { id } = req.params;

  try {
    const type = await ProductType.findById(id);

    if (!type) {
      return res.status(404).json({
        message: "product type not found",
      });
    } else {
      await ProductType.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Product Type deleted successfully",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// get a type
const getType = async (req, res) => {
  const { id } = req.params;

  try {
    const type = await ProductType.findById(id);

    if (!type) {
      return res.status(404).json({
        message: "Product type not found",
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: type,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// get all category
const getAllType = async (req, res) => {
  try {
    const all = await ProductType.find();

    if (!all || all.length === 0) {
      return res.status(404).json({
        message: "No Product type found",
      });
    } else {
      const counter = await ProductType.countDocuments();
      return res.status(200).json({
        message: "Success",
        count: counter,
        data: all,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createType,
  updateType,
  deleteType,
  getType,
  getAllType,
};
