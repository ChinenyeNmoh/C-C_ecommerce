const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const Product = require("../models/product");

// create cart
const createCart = async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;

  try {
    let products = [];

    // Check if there is already a cart associated with the user
    const alreadyExistCart = await Cart.findOne({ orderedby: _id });

    // If a cart already exists, remove it
    if (alreadyExistCart) {
      await Cart.findByIdAndDelete(alreadyExistCart._id)
    }
    // Use a Set to keep track of unique product IDs
    const uniqueProductIds = new Set();

    // Filter the cart array to keep only unique product IDs
    const uniqueCart = cart.filter(item => {
      const productId = item._id.toString();

      if (!uniqueProductIds.has(productId)) {
        uniqueProductIds.add(productId);
        return true;
      }
      return false;
    });


    // Iterate through each item in the unique cart array
    for (const cartItem of uniqueCart) {
      // Create an object to represent a product in the cart
      let object = {};
      const prod = await Product.findById(cartItem._id)
      object.productId = cartItem._id;

      // Retrieve the price of the product from the Product collection in the database
      const originalPrice = await Product.findById(cartItem._id).select("price").exec();
      const discountedPrice = await Product.findById(cartItem._id).select("discountedPrice").exec();
      const quantity = await Product.findById(cartItem._id).select("quantity").exec();
      const name = await Product.findById(cartItem._id).select("name").exec();
      if(discountedPrice.discountedPrice !== 0){
        object.price = discountedPrice.discountedPrice;
      }else{
        object.price = originalPrice.price
      }
      if(quantity.quantity === 0){
        return res.status(400).json({
          message: `Sorry ${name.name} is out of stuck`
        })
      }
      products.push(object);
    }
    // Calculate the total price of the cart
    let cartTotal = products.reduce((total, product) => total + product.price * 1, 0);

    // Create a new Cart instance and save it to the database
    let newCart = await new Cart({
      products,
      cartTotal,
      orderedby: _id,
    }).save();
    await newCart.populate([
      { path: "products.productId", select: 'name images',
      populate: { path: 'category', select: 'title' },
      populate: { path: 'productType', select: 'title' }
     }
    ])
    res.json({
      message: "New cart created successfully",
      data: newCart,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
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
        return res.status(404).json({
          message: "Product not found in the cart",
        });
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

        return res.status(400).json({
          message: "Quantity cannot be increased further, maximum quantity reached",
          data: updatedQty
        });
      }

      const updatedQty = await Cart.findOneAndUpdate(
        { orderedby: _id, "products.productId": id },
        {
          $inc: { "products.$.quantity": 1, "cartTotal": productPrice }
        },
        { new: true }
      );

      res.status(200).json({
        message: "Quantity increased successfully",
        data: updatedQty
      });
    } else {
      res.status(404).json({
        message: "Cart not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
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
        return res.status(404).json({
          message: "Product not found in the cart",
        });
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

        res.status(200).json({
          message: "Quantity decreased successfully",
          data: updatedQty
        });
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

        res.status(200).json({
          message: "Quantity set back to 1",
          data: updatedQty
        });
      }
    } else {
      res.status(404).json({
        message: "Cart not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};


// get users cart
const getCart = async(req, res) => {
  const { _id } = req.user
  try{
    //The populate method fetches the actual product details
    // from the Product model and replaces the reference(_id) in 
    // the products array with the actual product data.
    const userCart = await Cart.findOne({orderedby: _id}).populate(
      "products.productId"
    )
    if(!userCart){
      res.status(404).json({
        message: "Cart not found"
      })
    }
    res.status(200).json({
      message: "Cart found",
      data: userCart
    })
  }catch(err){
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

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
                res.status(200).json({
                    message: "Product deleted from cart",
                });
            } else {
                res.status(404).json({
                    message: "Product not found in cart",
                });
            }
        } else {
            res.status(404).json({
                message: "Product not found in cart",
            });
        }
    } else {
        res.status(404).json({
            message: "Product not found",
        });
    }
} catch (err) {
    console.log(err);
    res.status(500).json({
        message: "Internal server error",
        error: err.message,
    });
}
};
 
//empty cart

const emptyCart = async(req, res) => {
const { _id } = req.user;
try{
  const alreadyExistCart = await Cart.findOne({ orderedby: _id });
  if (alreadyExistCart) {
    await Cart.findByIdAndDelete(alreadyExistCart._id)
    return res.status(200).json({
      message: "Cart emptied successfully",
    });
  }else{
    res.status(404).json({
      message: "User has not Cart",
    });
  }
}catch (err) {
  console.error(err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
}
}

//apply coupon
const applyCoupon = async(req, res) => {
  const coupon  = req.body.name
  const { _id } = req.user
  try{
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (!validCoupon) {
      return res.status(400).json({
        message: "invalid coupon",
      });
    }else{
      let cartSum = await Cart.findOne({orderedby: _id,}).populate("products.productId")
      if(!cartSum){
        return res.status(404).json({
          message: "No cart found",
        });
      }
      let totalAfterDiscount = (cartSum.cartTotal - (cartSum.cartTotal * validCoupon.discount) / 100).toFixed(2); // round the calculated totalAfterDiscount to two decimal places
      const newCart = await Cart.findOneAndUpdate(
      { orderedby: _id },
      { totalAfterDiscount },
      { new: true }
      );
      res.status(200).json({
        message: "Coupon applied successfully",
        data: newCart
      });
    }
  }catch(err){
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

module.exports = {createCart, increaseQuantity, decreaseQuantity, getCart, deleteItem, emptyCart, applyCoupon};
