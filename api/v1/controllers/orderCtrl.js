const Cart = require("../models/cart");
const Product = require("../models/product");
const Address = require("../models/address");
const Order = require("../models/order");
const User = require("../models/user");
const opn = require("opn")
const Flutterwave = require('flutterwave-node-v3');
const { sendEmail, processOrderEmailTemplate, deliveredOrderEmailTemplate } = require('../utils/email');
const dotenv = require("dotenv")
dotenv.config({ path: './config/config.env' });

const flw = new Flutterwave(process.env.PUBLIC_KEY, process.env.SECRET_KEY);

const checkOut = async (req, res) => {
  const { _id } = req.user;
  const { paymentMethod, payload } = req.body;

  try {
    const alreadyOrdered = await Order.findOne({ user: _id });
    if (alreadyOrdered) {
      await Order.findByIdAndDelete(alreadyOrdered._id);
    }

    const userCart = await Cart.findOne({ orderedby: _id });
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Please select a payment method" });
    }

    let finalAmt = userCart.totalAfterDiscount || userCart.cartTotal;
    let newOrder = {};

    if (paymentMethod === "cash on delivery") {
      const address = await Address.findOne({ user: _id });

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      const shippingFee = 5000;
      newOrder = {
        user: _id,
        address: address._id,
        subTotal: userCart.cartTotal,
        subTotalAfterCoupon: finalAmt,
        shippingFee,
        totalPrice: finalAmt + shippingFee,
        products: userCart.products,
        paymentMethod,
      };
    }

    if (paymentMethod === "card") {
      const response = await flw.Charge.card(payload);
      console.log(response);

      if (response.meta.authorization.mode === 'pin') {
        let payload2 = payload;
        payload2.authorization = {
          "mode": "pin",
          "pin": 3310
        };
        /*if (response.meta.authorization.mode === 'redirect') {
          let url = response.meta.authorization.redirect
          opn(url)
          console.log(url)
      }*/
        
        const reCallCharge = await flw.Charge.card(payload2);
        const callValidate = await flw.Charge.validate({
          "otp": "12345",
          "flw_ref": reCallCharge.data.flw_ref
        });

        console.log(callValidate);

        if (callValidate.status === 'success') {
          const address = await Address.findOne({ user: _id });

          if (!address) {
            return res.status(404).json({ message: "Address not found" });
          }

          const shippingFee = 5000;
          newOrder = {
            user: _id,
            address: address._id,
            subTotal: userCart.cartTotal,
            subTotalAfterCoupon: finalAmt,
            shippingFee,
            totalPrice: finalAmt + shippingFee,
            products: userCart.products,
            paymentMethod,
            paymentStatus: "paid",
            paidAt: Date.now(),
          };
        } else {
          return res.status(400).json({ message: "Failed to process payment" });
        }
      }
    }
    const myOrder = await Order.create(newOrder);
    await myOrder.populate([
      { path: 'address', select: 'firstname lastname street city state landmark' },
      { path: 'user', select: 'local google address' },
      { path: 'products.productId', select: 'name price category images' }
    ]);

    const billingOwner = await User.findById(myOrder.user);
    const firstname = billingOwner.local ? billingOwner.local.firstname : billingOwner.google.firstname;
    const lastname = billingOwner.local ? billingOwner.local.lastname : billingOwner.google.lastname;
    const email = billingOwner.local ? billingOwner.local.email : billingOwner.google.email;
    const phoneNo = billingOwner.local ? billingOwner.local.mobile || "" : "";
    const htmlContent = processOrderEmailTemplate(myOrder, firstname, lastname, email, phoneNo);
    await sendEmail(email, 'Order confirmation', htmlContent);

    const update = myOrder.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.productId._id },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      };
    });

    const updated = await Product.bulkWrite(update, {});
    const delCart = await Cart.findOne({ orderedby: _id });

    if (delCart) {
      await Cart.findByIdAndDelete(delCart._id);
    }

    return res.status(201).json({
      message: "New Order Created. A confirmation email has been sent to your account",
      data: myOrder
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};


// get user order
const getMyOrder = async (req, res) => {
  const { _id } = req.user
  try {
    const userOrder = await Order.findOne({ user: _id })
    if (!userOrder) {
      res.status(404).json({
        message: "Order not found"
      })
    }
    await userOrder.populate([
      { path: 'address', select: 'firstname lastname street city state landmark' },
      { path: 'products.productId', select: 'title price category images' }
    ])
    res.status(200).json({
      message: "Order found",
      data: userOrder
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

// get user order
const getUserOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const userOrder = await Order.findOne({ user: id })
    if (!userOrder) {
      return res.status(404).json({
        message: "Order not found"
      })
    }
    await userOrder.populate([
      { path: 'address', select: 'firstname lastname street city state landmark' },
      { path: 'products.productId', select: 'name price category images' }
    ])
    res.status(200).json({
      message: "Order found",
      data: userOrder
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

// get all orders by admin
const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find();
    if (allOrders.length === 0) {
      return res.status(404).json({
        message: "No orders found"
      });
    }
    // Populate each order with address and product details
    await Promise.all(allOrders.map(async (order) => {
      await order.populate([
        { path: 'address', select: 'firstname lastname street city state landmark' },
        { path: 'products.productId', select: 'name price category images' }
      ]);
    }));
    res.status(200).json({
      message: "Orders found",
      data: allOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
      error: err.message
    });
  }
};

const confirmDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    const myOrder = await Order.findById(id);
    if (!myOrder) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    myOrder.orderStatus = "delivered";
    myOrder.deliveredAt = Date.now();
    myOrder.paymentStatus = "paid"
    await myOrder.save();
    await myOrder.populate([
      { path: 'address', select: 'firstname lastname street city state landmark' },
      { path: 'user', select: 'local google address' },
      { path: 'products.productId', select: 'name price category images' }
    ])
    const billingOwner = await User.findById(myOrder.user);
    firstname = billingOwner.local ? billingOwner.local.firstname : billingOwner.google.firstname;
    lastname = billingOwner.local ? billingOwner.local.lastname : billingOwner.google.lastname;
    email = billingOwner.local ? billingOwner.local.email : billingOwner.google.email;
    phoneNo = billingOwner.local ? billingOwner.local.mobile || "" : "";
    const htmlContent = deliveredOrderEmailTemplate(myOrder, firstname, lastname, email, phoneNo);
    await sendEmail(email, 'Order delivery confirmation', htmlContent);
    // Send a success response with the updated order
    return res.status(200).json({
      message: "Order delivered successfully",
      data: myOrder
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message
    });
  }
};

// delete order
const deleteOrder = async(req, res) => {
  const { id } = req.params;
    try{
      const alreadyExistOrder = await Order.findOne({ user: id });
      if (alreadyExistOrder) {
        await Order.findByIdAndDelete(alreadyExistOrder._id)
        return res.status(200).json({
          message: "Order deleted successfully",
        });
      }else{
        res.status(404).json({
          message: "User has not Order",
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
module.exports = { getMyOrder, checkOut, getUserOrder, getAllOrders, confirmDelivery, deleteOrder }
