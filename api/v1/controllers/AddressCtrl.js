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
                alternatePhoneNo: req.body?.alternatePhoneNo,
                user: _id,
            };

            const createdAddress = await Address.create(newAddress);

            return res.status(200).json({
                message: "Address created",
                data: createdAddress,
            });
        } else {
            const updatedAddress = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                street: req.body.street,
                city: req.body.city,
                state: req.body.state,
                landmark: req.body?.landmark,
                recipientPhoneNo: req.body.alternatePhoneNo,
            };

            const updatedAddressResult = await Address.findOneAndUpdate(
                { user: _id },
                updatedAddress,
                { new: true }
            );

            return res.status(200).json({
                message: "Address updated",
                data: updatedAddressResult,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message
        });
    }
};


// get address
const getAddress = async (req, res) => {
    try {
        const address = await Address.findOne({ user: req.user._id });

        if (address) {
            return res.status(200).json({
                message: "Address found",
                data: address,
            });
        } else {
            return res.status(404).json({
                message: "Address not found",
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: "Internal Server Error",
            message: err.message,
        });
    }
};


module.exports = {addAddress, getAddress};
