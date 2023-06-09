const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
