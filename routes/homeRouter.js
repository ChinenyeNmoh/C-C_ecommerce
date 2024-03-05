const Product = require('../models/product')
const Coupon = require('../models/coupon');
const Cart = require('../models/cart');
const express = require('express')
const router = express.Router()

// Home route
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ productType: "65df14e77530f1eb40012704" });
        let couponName = null;
        let discount = null;
        let isAuthenticated = req.user;
        let admin = false;
        
        // Check if the user is authenticated and has admin privileges
        if (isAuthenticated && isAuthenticated.role === 'admin') {
            admin = true;
        }
        
        // Retrieve valid coupon
        const validCoupon = await Coupon.findOne();
  
        if (validCoupon) {
            couponName = validCoupon.name;
            discount = validCoupon.discount;
        }
       const userCart = await Cart.find({ orderedby: req.user._id }).populate([
            {
                path: "products",
                select: "productId",
                populate: [{ path: 'productId', select: "name images" }]
            }
        ]);
        
        let cartQty = 0;
userCart.forEach(cartItem => {
    cartQty += cartItem.products.length;
});

        res.render('home', {
            layout: 'main',
            title: 'HomePage',
            products,
            couponName,
            discount,
            isAuthenticated,
            admin,
            cartQty
        });
    } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;