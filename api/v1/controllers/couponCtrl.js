const Coupon = require('../models/coupon');


// create coupon
const createCoupon = async (req, res) => {
  try {
    const newCoup = await Coupon.findOne({ name: req.body.name });

    if (newCoup) {
      return res.status(400).json({ message: "Coupon already exists!" });
    } else {
      const coup = await Coupon.create(req.body);
      return res.status(200).json({
        message: "Coupon created",
        data: coup,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// update coupon
const updateCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coup = await Coupon.findById(id);

    if (!coup) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    } else {
      const updatedCoup = await Coupon.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      return res.status(200).json({
        message: "Coupon updated successfully",
        data: updatedCoup,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// delete coupon
const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coup = await Coupon.findById(id);

    if (!coup) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    } else {
      await Coupon.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Coupon deleted successfully",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// get a coupon
const getCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const coup = await Coupon.findById(id);

    if (!coup) {
      return res.status(404).json({
        message: "Coupon not found",
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: coup,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// get all coupon
const getAllCoupon = async (req, res) => {
  try {
    const all = await Coupon.find();

    if (!all || all.length === 0) {
      return res.status(404).json({
        message: "No Coupon found",
      });
    } else {
      const counter = await Coupon.countDocuments();
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
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getCoupon,
  getAllCoupon,
};
