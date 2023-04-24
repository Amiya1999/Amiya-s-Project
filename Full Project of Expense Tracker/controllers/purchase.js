const Order = require('../models/order');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// const userController = require('./user');

const generateAccessToken = (id, ispremiumuser) => {
    return jwt.sign({ userId : id, ispremiumuser } ,'secretkey');
}

exports.purchasePremium = async (req, res, next) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 1000;
        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            req.user.createOrder({ orderid: order.id, status: 'PENDING' });
            return res.status(201).json({ order, key_id: rzp.key_id});
        });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'Something went wrong!', error: err});
    }
};

exports.updateTransactionStatus = async (req, res, next) => {
    try {
        const { order_id, payment_id } = req.body;
        const order =  await Order.findOne({ where: { orderid: order_id }});
        const promise1 = order.update( { paymentid: payment_id, status: 'SUCCESS' });
        const promise2 = req.user.update({ ispremiumuser: true });

        const userId = req.user.id;

        Promise.all([ promise1, promise2 ])
        .then(()=>{
            res.status(202).json({ success: true, message: 'Transaction successful', token: generateAccessToken(userId, true) });
        })
        .catch((err) => {
            throw new Error(err);
        });
    } catch(err) {
        console.log(err);
        res.status(403).json({ error: err, message: 'Something went wrong!' });
    }
};