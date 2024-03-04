const Cart = require("../models/cart");
const Product = require("../models/product");
const Address = require("../models/address");
const Order = require("../models/order");
const User = require("../models/user");
const Flutterwave = require('flutterwave-node-v3');
const { sendEmail, processOrderEmailTemplate, deliveredOrderEmailTemplate } = require('../utils/email');
const dotenv = require("dotenv")
dotenv.config({ path: './config/config.env' });

const flw = new Flutterwave(process.env.PUBLIC_KEY, process.env.SECRET_KEY);

const checkOut = async (req, res) => {
  const { _id } = req.user;
  const paymentMethod = req.body.paymentMethod;
  const payload = {}
  try {
    const userCart = await Cart.findOne({ orderedby: _id });
    if (!userCart) {
      req.flash('error', "Cart not found")
      const previousUrl = req.headers.referer || '/';
        res.redirect(previousUrl);
    }

    if (!paymentMethod) {
    req.flash('error', "Please select a payment Method")
    const previousUrl = req.headers.referer || '/';
        res.redirect(previousUrl);
    }

    let finalAmt = userCart.totalAfterDiscount || userCart.cartTotal;
    let newOrder = {};
    const shippingFee = 5000;

    if (paymentMethod === "cash on delivery") {
      const address = await Address.findOne({ user: _id });

      if (!address) {
        res.flash('warning', "No shipping address found")
      }

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
      const Total = finalAmt + shippingFee
      payload.card_number = req.body.card_number;
      payload.cvv = req.body.cvv;
      payload.expiry_month = req.body.expiry_month;
      payload.expiry_year = req.body.expiry_year;
      payload.fullname = req.body.fullname;
      payload.currency = 'NGN'
      payload.amount = Total
      payload.redirect_url = 'http://localhost:5000/api/order/getmyorder';
      payload.email = req.user.google.email || req.user.local.email;
      payload.phone_number = req.user.local?.mobile;
      payload.enckey = process.env.ENCRYPTION_KEY;
      payload.tx_ref = 'MC-32444ee--4eerye4euee3rerds4423e43e'
      const response = await flw.Charge.card(payload);
      console.log(response);

      if (response.meta.authorization.mode === 'pin') {
        let payload2 = payload;
        payload2.authorization = {
          "mode": "pin",
          "pin": 3310
        };
        if (response.meta.authorization.mode === 'redirect') {
          let url = response.meta.authorization.redirect
          console.log(url)
          return res.redirect(url);
      }
        
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
      { path: 'address', select: 'firstname lastname street city state landmark recipientPhoneNo' },
      { path: 'user', select: 'local google address' },
      { path: 'products.productId', select: 'name price images', 
      populate: [
        { path: 'category', select: 'title' },
        { path: 'productType', select: 'title' }
      ] }
    ]);

    const billingOwner = await User.findById(myOrder.user);
    const firstname = billingOwner.local.firstname || billingOwner.google.firstname;
    const lastname = billingOwner.local.lastname || billingOwner.google.lastname;
    const email = billingOwner.local.email || billingOwner.google.email;
    const phoneNo = billingOwner.local.mobile || "" 
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
  let admin = false;
  if (req.user && req.user.role === 'admin') {
    admin = true;
  } 
  console.log(admin)
    req.flash('success', 'Order has been created')
    res.render('shop/order', {layout: "main", 
    title: 'Orders', 
    myOrder, 
    firstname, 
    lastname, 
    email, 
    phoneNo,
    isAuthenticated: req.user,
    admin,
  })
  } catch (err) {
    console.error(err);
    res.render('error', {layout: "main", title: 'Error', err})
  }
};

const getMyOrder = async (req, res) => {
  const { _id } = req.user;
  try {
    const myOrders = await Order.find({ user: _id }).populate([
      { path: 'address', select: 'firstname lastname street city state landmark recipientPhoneNo' },
      { path: 'user', select: 'local google address' },
      { path: 'products.productId', select: 'name price images', 
        populate: [
          { path: 'category', select: 'title' },
          { path: 'productType', select: 'title' }
        ] 
      }
    ]);
    
    if (myOrders.length === 0) {
      req.flash('error', "No Orders found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    req.flash('success', "Orders found");
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    res.render('shop/show_orders', {
      layout: "main", 
      title: 'Orders', 
      myOrders, 
      isAuthenticated: req.user,
      admin
    });
  } catch (err) {
    console.error(err);
    res.render('error', { layout: "main", title: 'Error', err });
  }
};

// get user order
const getUserOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const allOrders = await Order.find({ user: id }).populate([
      { path: 'address', select: 'firstname lastname street city state landmark' },
      { path: 'user', select: 'local google address' },
      { path: 'products.productId', select: 'name price images' }
    ]).populate([
      { path: 'products.productId.category', select: 'title' },
      { path: 'products.productId.productType', select: 'title' }
    ]);
    
    if (!allOrders || allOrders.length === 0) {
      req.flash('error', "No Orders found for User");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    const count = allOrders.length;
    console.log(count)
    req.flash('success', "Orders found");
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
    } 
    res.render('admin/user_order', {
      layout: "main", 
      title: 'User Orders', 
      allOrders, 
      isAuthenticated: req.user,
      admin,
      count
    });
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.redirect('/');
  }
}


//get pending Orders
const getPendingOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({orderStatus: "ordered"});
    if (allOrders.length === 0) {
      req.flash('error', "No Pending Order found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    // Populate each order with address and product details
    await Promise.all(allOrders.map(async (order) => {
      await order.populate([
        { path: 'address', select: 'firstname lastname street city state landmark recipientPhoneNo' },
        { path: 'user', select: 'local google address' },
        { path: 'products.productId', select: 'name price images', 
        populate: [
          { path: 'category', select: 'title' },
          { path: 'productType', select: 'title' }
        ] }
      ]);
    }));
    const count = allOrders.length;
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    res.render('admin/all_orders', {
      layout: "main", 
      title: 'Orders', 
      allOrders,
      count,
      isAuthenticated: req.user,
      admin
    });
  } catch (err) {
    console.error(err);
    console.error(err);
    res.render('error', {layout: "main", title: 'Error', err})
  }
};

//get Delivered Orders
const getDeliveredOrders = async (req, res) => {
  try {
    const allOrders = await Order.find({orderStatus: "delivered"});
    if (allOrders.length === 0) {
      req.flash('error', "No Delivered Order found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    // Populate each order with address and product details
    await Promise.all(allOrders.map(async (order) => {
      await order.populate([
        { path: 'address', select: 'firstname lastname street city state landmark recipientPhoneNo' },
        { path: 'user', select: 'local google address' },
        { path: 'products.productId', select: 'name price images', 
        populate: [
          { path: 'category', select: 'title' },
          { path: 'productType', select: 'title' }
        ] }
      ]);
    }));
    const count = allOrders.length;
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    res.render('admin/all_orders', {
      layout: "main", 
      title: 'Orders', 
      allOrders,
      count,
      isAuthenticated: req.user,
      admin
    });
  } catch (err) {
    console.error(err);
    console.error(err);
    res.render('error', {layout: "main", title: 'Error', err})
  }
};
// get all orders by admin
const getAllOrders = async (req, res) => {
  try {
    const allOrders = await Order.find();
    if (allOrders.length === 0) {
      req.flash('error', "No Orders found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    // Populate each order with address and product details
    await Promise.all(allOrders.map(async (order) => {
      await order.populate([
        { path: 'address', select: 'firstname lastname street city state landmark recipientPhoneNo' },
        { path: 'user', select: 'local google address' },
        { path: 'products.productId', select: 'name price images', 
        populate: [
          { path: 'category', select: 'title' },
          { path: 'productType', select: 'title' }
        ] }
      ]);
    }));
    const count = await Order.countDocuments();
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    res.render('admin/all_orders', {
      layout: "main", 
      title: 'Orders', 
      allOrders,
      count,
      isAuthenticated: req.user,
      admin
    });
  } catch (err) {
    console.error(err);
    res.render('error', {layout: "main", title: 'Error', err})
  }
};

const confirmDelivery = async (req, res) => {
  const { id } = req.params;
  try {
    const myOrder = await Order.findById(id);
    if (!myOrder) {
      req.flash('error', "No Orders found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }

    myOrder.orderStatus = "delivered";
    myOrder.deliveredAt = new Date(Date.now());
    myOrder.paymentStatus = "paid"
    await myOrder.save();
    await myOrder.populate([
      { path: 'address', select: 'firstname lastname street city state landmark' },
      { path: 'user', select: 'local google address' },
      { path: 'products.productId', select: 'name price images', 
      populate: [
        { path: 'category', select: 'title' },
        { path: 'productType', select: 'title' }
      ] }
    ]);
    const billingOwner = await User.findById(myOrder.user);
    firstname = billingOwner.local.firstname || billingOwner.google.firstname;
    lastname = billingOwner.local.lastname || billingOwner.google.lastname;
    email = billingOwner.local.email || billingOwner.google.email;
    phoneNo = billingOwner.local.mobile ||  "";
    const htmlContent = deliveredOrderEmailTemplate(myOrder, firstname, lastname, email, phoneNo);
    await sendEmail(email, 'Order delivery confirmation', htmlContent);
    // Send a success response with the updated order
    req.flash('success', "Delivery Confirmed. Delivery Mail Sent");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
  } catch (err) {
    console.error(err);
    res.render('error', {layout: "main", title: 'Error', err})
  }
};

const deleteOrder = async (req, res) => {
  console.log('delete was hit')
  const { id } = req.params;
  console.log(id);
  try {
    const order = await Order.findOneAndDelete({_id:id});
    const remOrders = await Order.find()
    console.log(remOrders)
    if (order) {
      req.flash('success', "Order Deleted");
      if(remOrders.length === 0){
        req.flash('success', "No Order To Display");
        return res.redirect("/api/product/");
      }
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    } else {
      req.flash('error', "something went wrong")
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
  } catch (err) {
    console.error(err);
    req.flash('error', "An error occurred while deleting the order");
  }
};

module.exports = {
  getMyOrder,
  checkOut,
  getUserOrder,
  getAllOrders,
  confirmDelivery,
  deleteOrder,
  getDeliveredOrders,
  getPendingOrders
 }
