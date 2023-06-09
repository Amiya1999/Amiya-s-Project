const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  ispremiumuser: {
    type:Boolean,
    default:true
  },
  totalExpenses: {
    type: Number,
    default: 0
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],
  expenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense'
    }
  ],
  forgotPswds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForgotPswd'
    }
  ],
  downloadedExpenses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DownloadedExpense'
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
