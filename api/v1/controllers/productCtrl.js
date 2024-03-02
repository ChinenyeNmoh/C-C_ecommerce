const Product = require('../models/product')
const Coupon = require('../models/coupon')
const Cart = require('../models/cart');
const slugify = require('slugify')


// Create new product
const createProduct = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const imagesArray = [{ url: req.body.images }];
    req.body.images = imagesArray;
    const newProduct = await Product.create(req.body);
    req.flash('success', 'Product Created');
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  } catch (err) {
    console.log(err.message);
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
};

//get create product view
const getCreate = async(req, res) => {
  res.render('admin/create_product', {
    layout: 'main',
    title: "Create Product",
    isAuthenticated: req.user,
    admin: req.user?.role
  })
} 


// get a product
const getProduct = async (req, res) => {
  console.log('getProduct was hit')
    const { id } = req.params;
    try {
      const product = await Product.findById(id).populate([
        {path: "ratings.postedby", select: "local.firstname local.lastname"}
      ]).select("name price description discountedPrice ratings images"); 
      if (product) {
        return res.render('shop/show_product', { 
          layout: 'main', 
          title: "products",
           product,
           isAuthenticated: req.user,
           admin: req.user?.role,
          })
      } else {
        return res.render('error', { layout: 'main', title: 'Products' });
      }
    } catch (err) {
      console.log(err)
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
    let query = Product.find(JSON.parse(queryStr));
    query = query.populate([
      { path: 'category', select: 'title' },
      { path: 'productType', select: 'title' }
    ]);

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Limit fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    let nextPage = null;
    let prevPage = null;
    let productCount = null;
    let currentPage;
    let totalPages;

    if (req.query.page) {
      productCount = await Product.countDocuments(queryObj);
      totalPages = Math.ceil(productCount / limit);
      
      if (skip >= productCount) {
        return res.status(404).json({
          message: 'Page not found',
        });
      }

// Next page
currentPage = page;
if (currentPage < totalPages) {
  nextPage = `/api/product/?page=${currentPage + 1}`;
  if (req.query) {
    nextPage = `${nextPage}&${new URLSearchParams(queryObj).toString()}`;
  }
} else {
  nextPage = null; 
}
      // Previous page
      if (currentPage > 1) {
        prevPage = `/api/product/?page=${currentPage - 1}`;
        if (req.query) {
          prevPage = `${prevPage}&${new URLSearchParams(queryObj).toString()}`;
        }
      } else {
        prevPage = null
      }
    }

    // Execute query
    const products = await query.skip(skip).limit(limit).exec();
    if (products && products.length > 0) {
      return res.render('shop/shopping_page', { 
        layout: 'main', 
        products, 
        isAuthenticated: req.user, 
        admin: req.user?.role, 
        title: 'Products', 
        currentPage, 
        nextPage, 
        prevPage 
      });
    } else {
      return res.status(404).json({
        message: 'Sorry, could not retrieve products. No product found',
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
  console.log("i was hit oh")  
  const {id} = req.params;
  console.log(id)
  try{
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const findProduct = await Product.findById(id)
    console.log(findProduct)
    req.body.productType = req.body.productType? req.body.productType : findProduct.productType
    req.body.category = req.body.category? req.body.category: findProduct.category
    req.body.name = req.body.name? req.body.name: findProduct.name;
    req.body.price = req.body.price? req.body.price: findProduct.price;
    req.body.description = req.body.description? req.body.description: findProduct.description;
    req.body.quantity = req.body.quantity? req.body.quantity: findProduct.quantity;
    req.body.images = req.body.images? req.body.images: findProduct.images;
    const product = await Product.findByIdAndUpdate(id, req.body,{new: true})
    if (product) {
      req.flash('success', "Product updated successfully");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
     
    } else {
      req.flash('error', "Product not found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
    }
  }catch(err){
    req.flash('error', err.message);
    console.log(err.message)
    const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
  }
}

//get update view
 const getUpdate = async(req, res) => {
  const prodId = req.params.id
  res.render('admin/create_product', {
    layout: 'main',
    prodId,
    title: "Create Product",
    isAuthenticated: req.user,
    admin: req.user?.role
  })
  
}


const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);
    const cart = await Cart.findOneAndDelete({ "products.productId": id });
    if (product) {
      req.flash('success', "Product deleted successfully");
      return res.redirect('/api/product/');
    } else {
      req.flash('error', "Product not found");
      return res.redirect('/');
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    req.flash('error', "An error occurred while deleting the product");
    return res.redirect('/');
  }
};

// ratings
const productRating = async (req, res) => {
  const { _id } = req.user;
  const prodId = req.params.id;
  const { star, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let rateProduct;

    if (!product) {
      req.flash('error', `Product with id ${prodId} not found`);
      return res.redirect(`/api/product/${prodId}`);
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
        req.flash('success', 'product successfully rated');
        return res.redirect(`/api/product/${prodId}`);
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
        req.flash('success', 'Product successfully rated');
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

    return res.redirect(`/api/product/${prodId}`);
  } catch (err) {
    console.log(err);
    req.flash('error', err.message);
    return res.redirect(`/api/product/${prodId}`);
  }
};


// apply discount
const applyDiscount = async (req, res) => {
  const { id } = req.params;
  const { discount } = req.body;
  try {
    const findProduct = await Product.findById(id);
    if (!findProduct) {
      req.flash('error', 'Product not Found');
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
    }
    let discountedPrice = (findProduct.price * (100 - discount)) / 100;
    discountedPrice = discountedPrice.toFixed(2);

    await Product.findByIdAndUpdate(
      id,
      { discountedPrice },
      { new: true }
    );
      req.flash('success', `${discount}% discount applied successfully`)
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl)
  } catch (err) {
    req.flash('error', err.message);
    console.log(err.message)
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl)
  }
};

//get the discount product view
const getDiscount = (req, res)=> {
  const prodId = req.params.id
  res.render('admin/apply_discount', {
    layout: 'main',
    prodId,
    title: "Create Discount",
    isAuthenticated: req.user,
    admin: req.user?.role
  })
}

// apply discount
const applyAllDiscount = async (req, res) => {
  const { discount } = req.body;
  try {
    const findProducts = await Product.find({});
    if (!findProducts || findProducts.length === 0) {
      req.flash('error', 'Product not Found');
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
    }

    const updatedProducts = await Promise.all(findProducts.map(async (product) => {
      let discountedPrice = (product.price * (100 - discount)) / 100;
      discountedPrice = discountedPrice.toFixed(2);

      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        { discountedPrice },
        { new: true }
      );

      return updatedProduct;
    }));
    req.flash('success', `${discount}% discount applied To All Products`)
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl)
  } catch (err) {
    req.flash('error', err.message);
    console.log(err)
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl)
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
      req.flash('success', 'Discount removed');
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
  } catch (err) {
    req.flash('error', err.message);
    console.log(err)
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl)
  }
};


// remove All products discount
const removeAllDiscount = async (req, res) => {
  try {
    const result = await Product.updateMany({}, { discountedPrice: 0 });
    if (result.nModified === 0) {
      req.flash('error', 'No Product with discount Found');
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl)
    }

    req.flash('success', 'Discount removed');
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl)
  } catch (err) {
    req.flash('error', err.message);
    console.log(err)
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl)
  }
};


module.exports = { 
  createProduct, 
  applyDiscount, 
  applyAllDiscount, 
  removeAllDiscount, 
  removeProductDiscount, 
  getProduct,
  getUpdate,
  getAllProduct, 
  updateProduct, 
  deleteProduct, 
  productRating,
  getCreate,
  getDiscount,
}