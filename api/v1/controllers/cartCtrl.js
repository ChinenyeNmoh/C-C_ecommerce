const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Product = require("../models/product");
const { ObjectId } = require('mongodb');


const createCart = async (req, res) => {
  const cartItemId = req.params.id;
  const { _id } = req.user;

  try {
    let products = [];
    let cartTotal = 0;

    // Retrieve the product details
    const product = await Product.findById(cartItemId);
    
    // Check if the product exists
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const quantity = await Product.findById(cartItemId).select("quantity").exec();
    const prodName = await Product.findById(cartItemId).select("name").exec();
    if(quantity.quantity === 0){
      req.flash('error',`Sorry ${prodName.name} is out of stuck`)
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
     
    }
    // Check if there is already a cart associated with the user
    let alreadyExistCart = await Cart.findOne({ orderedby: _id });

    if (!alreadyExistCart) {
      // If no cart exists, create a new one
      products.push({
        productId: product._id,
        price: product.discountedPrice !== 0 ? product.discountedPrice : product.price
      });
      cartTotal += product.price;
      
      // Create a new Cart instance and save it to the database
      alreadyExistCart = await new Cart({
        products,
        cartTotal,
        orderedby: _id,
      }).save();
      req.flash('success', 'Product added to cart');
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    } else {
      // If cart exists, check if the product is already added
      const addedBefore = alreadyExistCart.products.some(prod => prod.productId.equals(product._id));

      if (addedBefore) {
        req.flash('warning', 'Product has already been added to the cart');
         // Redirect to the previous URL after adding the product to the cart
        const previousUrl = req.headers.referer || '/';
        return res.redirect(previousUrl);
      } else {
        // Add the product to the existing cart
        alreadyExistCart.products.push({
          productId: product._id,
          price: product.discountedPrice !== 0 ? product.discountedPrice : product.price
        });
        cartTotal = alreadyExistCart.cartTotal + product.price;
        alreadyExistCart.cartTotal = cartTotal;
        await alreadyExistCart.save();
        req.flash('success', 'Product added to cart');
        // Redirect to the previous URL after adding the product to the cart
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
      }
    }

  } catch (err) {
    console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
  }
};

const increaseQuantity = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  try {
    const alreadyExistCart = await Cart.findOne({ orderedby: _id, "products.productId": id });
    if (alreadyExistCart) {
      const productPrice = alreadyExistCart.products.find(product => product.productId == id)?.price;

      if (!productPrice) {
        req.flash('error', 'Product not found in cart')
      }

      const getQuantity = (await Product.findById(id)).quantity;
      const cartProduct = alreadyExistCart.products.find(product => product.productId == id);
      if (cartProduct.quantity >= getQuantity) {
        const updatedQty = await Cart.findOneAndUpdate(
          { orderedby: _id, "products.productId": id },
          {
            $set: {
              "products.$.quantity": getQuantity,
              "cartTotal": alreadyExistCart.cartTotal
            }
          },
          { new: true }
        );

        req.flash('error', "Quantity cannot be increased further, maximum quantity reached")
        return res.redirect('/api/cart/getcart');
        
      }

      const updatedQty = await Cart.findOneAndUpdate(
        { orderedby: _id, "products.productId": id },
        {
          $inc: { "products.$.quantity": 1, "cartTotal": productPrice }
        },
        { new: true }
      );

    req.flash('success', "Quantity increased successfully")
      // Redirect to the previous URL after adding the product to the cart
    const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    } else {
      req.flash('error', "Cart not found")
       // Redirect to the previous URL after adding the product to the cart
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
    }
  } catch (err) {
    console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
  }
};

const decreaseQuantity = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  try {
    const alreadyExistCart = await Cart.findOne({ orderedby: _id, "products.productId": id });
    if (alreadyExistCart) {
      const product = alreadyExistCart.products.find(product => product.productId == id);

      if (!product) {
        req.flash('error', 'Product not found in cart')
         // Redirect to the previous URL after adding the product to the cart
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
      }

      // Ensure quantity does not go below 1
      if (product.quantity > 1) {
        const productPrice = product.price;

        const updatedQty = await Cart.findOneAndUpdate(
          { orderedby: _id, "products.productId": id },
          {
            $inc: {
              "products.$.quantity": -1,
              "cartTotal": -productPrice
            }
          },
          { new: true }
        );

        req.flash('success', "Quantity decreased successfully")
      // Redirect to the previous URL after adding the product to the cart
    const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl)
      } else {
        // set quantity back to 1
        const updatedQty = await Cart.findOneAndUpdate(
          { orderedby: _id, "products.productId": id },
          {
            $set: {
              "products.$.quantity": 1,
              "cartTotal": alreadyExistCart.cartTotal
            }
          },
          { new: true }
        );
        req.flash('error', "Quantity cannot be less than 1")
        const previousUrl = req.headers.referer || '/';
        res.redirect(previousUrl);
      }
    } else {
      req.flash('error', "Cart not found")
    }
  } catch (err) {
    console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
  }
};

const getCart = async (req, res) => {
  const { _id } = req.user;

  try {
    const userCart = await Cart.findOne({ orderedby: _id }).populate([
      {
        path: "products",
        select: "productId",
        populate: [{ path: 'productId', select: "name images" }]
      }
    ]);
    if (!userCart) {
      req.flash('error', 'You have no item in your Cart');
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }
    const cartQty = userCart?.products.length;
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    res.render('shop/cart', { layout: 'main', 
    userCart, 
    title: 'Cart', 
    cartQty, 
    isAuthenticated: req.user, 
    admin
  });
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.render('shop/cart', { layout: 'main', err, title: 'Cart' });
  }
};

// delete an item in a cart
const deleteItem = async (req, res) => {
const { id } = req.params;
try {
    const item = await Product.findById(id);
    if (item) {
        const itemInCart = await Cart.findOne({ "products.productId": id });
        if (itemInCart) {
            const productIndex = itemInCart.products.findIndex(prod => prod.productId.toString() === id.toString());
            if (productIndex !== -1) {
                const price = itemInCart.products[productIndex].price;
                const cartTotal = itemInCart.cartTotal - price;
                console.log(cartTotal)
                itemInCart.products.splice(productIndex, 1);
                await itemInCart.save();
                await Cart.findOneAndUpdate(
                  {orderedby: req.user._id},
                  {cartTotal: cartTotal},
                  {new: true}
                  )
                req.flash('success', "product has been deleted")
                const previousUrl = req.headers.referer || '/';
                res.redirect(previousUrl);

            } else {
              req.flash('error', "product not found in the cart")
              const previousUrl = req.headers.referer || '/';
              res.redirect(previousUrl);
            }
        } else {
          req.flash('error', "product not found in the cart")
          const previousUrl = req.headers.referer || '/';
          res.redirect(previousUrl);
        }
    } else {
      req.flash('error', "product not found in the cart")
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }
} catch (err) {
  console.log(err)
  req.flash('error', err.message);
  const previousUrl = req.headers.referer || '/';
  res.redirect(previousUrl);
}
};
 
//empty cart

const emptyCart = async(req, res) => {
const { _id } = req.user;
try{
  const alreadyExistCart = await Cart.findOne({ orderedby: _id });
  console.log(alreadyExistCart)
  if (alreadyExistCart) {
    await Cart.findByIdAndDelete(alreadyExistCart._id)
   req.flash('success', 'Cart has been emptied')
   res.redirect('/api/product/')
  }else{
    req.flash('error', 'Cart not found')
  }
}catch (err) {
  console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
}
}

//apply coupon
const applyCoupon = async(req, res) => {
  const coupon  = req.body.name
  console.log(coupon)
  const { _id } = req.user
  try{
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) {
      req.flash('error', 'Invalid coupon')
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }else{
      let cartSum = await Cart.findOne({orderedby: _id,}).populate("products.productId")
      if(!cartSum){
        req.flash('error', 'No cart found')
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
      }
      let totalAfterDiscount = (cartSum.cartTotal - (cartSum.cartTotal * validCoupon.discount) / 100).toFixed(2); // round the calculated totalAfterDiscount to two decimal places
      const newCart = await Cart.findOneAndUpdate(
      { orderedby: _id },
      { totalAfterDiscount },
      { new: true }
      );
      req.flash('success', 'coupon applied')
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }
  }catch(err){
    console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
  }
}

module.exports = {createCart, increaseQuantity, decreaseQuantity, getCart, deleteItem, emptyCart, applyCoupon};
