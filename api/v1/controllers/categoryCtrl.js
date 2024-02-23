const Product = require('../models/product');
const User = require('../models/user');
const Category = require('../models/category');

// create category
const createCategory = async (req, res) => {
  try {
    const newCat = await Category.findOne({ title: req.body.title });

    if (newCat) {
      return res.status(400).json({ message: "Category already exists!" });
    } else {
      const cat = await Category.create(req.body);

      return res.status(200).json({
        message: "Category created",
        data: cat,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// update category
const updateCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const cat = await Category.findById(id);

    if (!cat) {
      return res.status(404).json({
        message: "Category not found",
      });
    } else {
      const updatedCat = await Category.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return res.status(200).json({
        message: "Category updated successfully",
        data: updatedCat,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// delete category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const cat = await Category.findById(id);

    if (!cat) {
      return res.status(404).json({
        message: "Category not found",
      });
    } else {
      await Category.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Category deleted successfully",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// get a category
const getCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const cat = await Category.findById(id);

    if (!cat) {
      return res.status(404).json({
        message: "Category not found",
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: cat,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// get all category
const getAllCategory = async (req, res) => {
  try {
    const all = await Category.find();

    if (!all || all.length === 0) {
      return res.status(404).json({
        message: "No Category found",
      });
    } else {
      const counter = await Category.countDocuments();
      return res.status(200).json({
        message: "Success",
        count: counter,
        data: all,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
};
