const mongoose = require('mongoose');

const forgotPswdSchema = new mongoose.Schema({
  isActive: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const ForgotPswd = mongoose.model('ForgotPswd', forgotPswdSchema);

module.exports = ForgotPswd;
