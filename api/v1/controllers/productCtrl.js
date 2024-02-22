const Product = require('../models/product')
const Coupon = require('../models/coupon')
const User = require('../models/user');
const slugify = require('slugify')

// Create new product
const createProduct = async (req, res) => {
    try {
      if (req.body.name) {
        req.body.slug = slugify(req.body.name);
      }
      const newProduct = await Product.create(req.body);
  
      return res.json({
        message: `New product ${req.body?.name} created`,
        data: newProduct,
      });
    } catch (err) {
      if (err.name === 'ValidationError' && err.errors) {
        const validationErrors = Object.values(err.errors).map((error) => error.message);
  
        return res.status(400).json({
          message: 'Validation failed',
          validationErrors: validationErrors,
        });
      }
  
      return res.status(500).json({
        message: err.message,
      });
    }
  };
  
// get a product
const getProduct = async (req, res) => {
    const { id } = req.params;
  
    try {
      const product = await Product.findById(id);
  
      if (product) {
        return res.status(200).json({
          message: 'Product found',
          data: product,
        });
      } else {
        return res.status(404).json({
          message: `Product with id ${id} not found`,
        });
      }
    } catch (err) {
      return res.status(500).json({
        message: err.message,
      });
    }
  };
  
  // get all products
  const getAllProduct = async (req, res) => {
    try {
      // Filtering
      const queryObj = { ...req.query };
      const excludeFields = ["page", "sort", "limit", "fields"];
      excludeFields.forEach((el) => delete queryObj[el]);
  
      // Convert to string and back to JSON
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      const query = Product.find(JSON.parse(queryStr));
  
      // Sorting
      if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query.sort(sortBy);
      } else {
        query.sort("-createdAt");
      }
  
      // Limit fields
      if (req.query.fields) {
        const fields = req.query.fields.split(",").join(" ");
        query.select(fields);
      } else {
        query.select("-__v");
      }
  
      // Pagination
      const page = req.query.page || 1;
      const limit = req.query.limit || 10;
      const skip = (page - 1) * limit;
      query.skip(skip).limit(limit);
  
  
      if (req.query.page) {
        const productCount = await Product.countDocuments();
        if (skip >= productCount) {
          return res.status(404).json({
            message: 'Page not found',
          });
        }
      }
      // Execute query
      const products = await query.exec();
  
      if (products && products.length > 0) {
        const counter = await Product.countDocuments();
        return res.status(200).json({
          message: 'Products found',
          count: counter,
          data: products,
        });
      } else {
        return res.status(404).json({
          message: 'Sorry, could not retrieve products',
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.message,
      });
    }
  };  


  //update a product
const updateProduct = async(req, res) => {
  const {id} = req.params;
  try{
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const product = await Product.findByIdAndUpdate(id, req.body,{new: true})
    if (product) {
      return res.status(200).json({
        message: "Product updated successfully",
        data: product,
      });
    } else {
      return res.status(404).json({
        message: "Product not found",
      });
    }
  }catch(err){
    return res.status(500).json({
      message: err.message,
    });
  }
}

//delete a product
const deleteProduct = async(req, res) => {
  const {id} = req.params;
  try{
    const product = await Product.findByIdAndDelete(id)
    if (product) {
      return res.status(200).json({
        message: `Product with id ${id} deleted successfully`,
        data: product,
      });
    } else {
      return res.status(404).json({
        message: `Product with id ${id} not found`,
      });
    }
  }catch(err){
    return res.status(500).json({
      message: err.message,
    });
  }
}


// ratings
const productRating = async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let rateProduct;

    if (!product) {
      return res.status(404).json({
        message: `Product with id ${prodId} not found`,
      });
    } else {
      let alreadyRated = product.ratings.find(
        (userId) => userId.postedby.toString() === _id.toString()
      );
      
      if (alreadyRated) {
        const updatedProd = await Product.updateOne(
          {
            ratings: { $elemMatch: alreadyRated },
          },
          {
            $set: { "ratings.$.star": star, "ratings.$.comment": comment },
          },
          { new: true }
        );
        
        res.json({
          status: "success",
          data: updatedProd,
        });
      } else {
        rateProduct = await Product.findByIdAndUpdate(
          prodId,
          {
            $push: {
              ratings: {
                star: star,
                comment: comment,
                postedby: _id,
              },
            },
          },
          {
            new: true,
          }
        );

        res.json({
          status: "success",
          data: rateProduct,
        });
      }
    }

    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};


// apply discount
const applyDiscount = async (req, res) => {
  const { id } = req.params;
  const coupon = req.body.coupon;
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) {
      return res.status(400).json({
        message: "Invalid coupon",
      });
    }

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(400).json({
        message: "Product not found",
      });
    }

    let discountedPrice = (findProduct.price * (100 - validCoupon.discount)) / 100;
    discountedPrice = discountedPrice.toFixed(2);

    await Product.findByIdAndUpdate(
      id,
      { discountedPrice },
      { new: true }
    );

    res.status(200).json({
      message: `${validCoupon.discount}% discount applied successfully`,
      data: findProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// apply discount
const applyAllDiscount = async (req, res) => {
  const coupon = req.body.coupon;
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) {
      return res.status(400).json({
        message: "Invalid coupon",
      });
    }

    const findProducts = await Product.find({});
    if (!findProducts || findProducts.length === 0) {
      return res.status(400).json({
        message: "Products not found",
      });
    }

    const updatedProducts = await Promise.all(findProducts.map(async (product) => {
      let discountedPrice = (product.price * (100 - validCoupon.discount)) / 100;
      discountedPrice = discountedPrice.toFixed(2);

      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { discountedPrice },
        { new: true }
      );

      return updatedProduct;
    }));

    res.status(200).json({
      message: `${validCoupon.discount}% discount applied successfully`,
      data: updatedProducts,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// remove a products discount
const removeProductDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(400).json({
        message: "Product not found",
      });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { discountedPrice: 0 },
      { new: true }
    );

    res.status(200).json({
      message: "Discount removed from  product successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};


// remove All products discount
const removeAllDiscount = async (req, res) => {
  try {
    const result = await Product.updateMany({}, { discountedPrice: 0 });
    if (result.nModified === 0) {
      return res.status(400).json({
        message: "No products found or discounts already removed",
      });
    }

    res.status(200).json({
      message: "Discount removed from all products successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};


module.exports = { createProduct, applyDiscount, applyAllDiscount, removeAllDiscount, removeProductDiscount, getProduct, getAllProduct, updateProduct, deleteProduct, productRating}