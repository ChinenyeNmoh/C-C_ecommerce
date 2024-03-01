const Product = require('../models/product');
const User = require('../models/user');
const Address = require('../models/address');
const Order = require('../models/order');

// add address

const addAddress = async (req, res) => {
    const { _id } = req.user;

    try {
        const existingAddress = await Address.findOne({ user: _id });

        if (!existingAddress) {
            const newAddress = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                landmark: req.body?.landmark,
                recipientPhoneNo: req.body.recipientPhoneNo,
                user: _id,
            };

            const address = await Address.create(newAddress);

            req.flash('success', 'Address created')
            res.render('shop/address', {
                layout: "main",
                title: "Address",
                isAuthenticated: req.user,
                admin: req.user?.role,
                address
            })
        } else {
            const updatedAddress = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                landmark: req.body?.landmark,
                recipientPhoneNo: req.body.recipientPhoneNo,
            };

            const address = await Address.findOneAndUpdate(
                { user: _id },
                updatedAddress,
                { new: true }
            );

            req.flash('success', 'Address created')
            res.render('shop/address', {
                layout: "main",
                title: "Address",
                isAuthenticated: req.user,
                admin: req.user?.role,
                address
            })
        }
    } catch (err) {
        console.error(err);
        res.render('error', {layout: "main"})
    }
};


// get address
const getAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ user: req.user._id });
        console.log(address)

        if (address) {
            res.render('shop/address', {
                layout: "main", 
                title: 'Address', 
                address,
                isAuthenticated: req.user, 
                admin: req.user?.role
            })
        } else {
            res.render('shop/address', {
                layout: "main", 
                title: 'Address', 
                address,
                isAuthenticated: req.user, 
                admin: req.user?.role
            })
        }
    } catch (err) {
        console.error(err);
        res.render('error', {layout: 'main', title: 'error'})
    }
};
module.exports = {addAddress, getAddress};
