const Order = require('../models/order');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const mongoose = require('mongoose');

exports.purchasePremium = async (req, res, next) => {
  try {
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const amount = 1000;

    rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to create order' });
      }

      const orderId = order._id;
      req.user.orders.push(orderId); // No need to convert it to ObjectId

      res.status(201).json({ order, key_id: rzp.key_id });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};

exports.updateTransactionStatus = async (req, res, next) => {
  try {
    const { order_id, payment_id } = req.body;
    const order = await Order.findOne({ _id: order_id }); // No need to convert it to ObjectId
    
    const promise1 = order.updateOne({ paymentid: payment_id, status: 'SUCCESS' });
    const promise2 = req.user.updateOne({ ispremiumuser: true });

    const userId = req.user._id;

    Promise.all([promise1, promise2])
      .then(() => {
        res.status(202).json({ success: true, message: 'Transaction successful', token: generateAccessToken(userId, true) });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: 'Something went wrong!' });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
  }
};
