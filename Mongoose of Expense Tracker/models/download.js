const mongoose = require('mongoose');

const downloadedExpenseSchema = new mongoose.Schema({
  fileURL: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const DownloadedExpense = mongoose.model('DownloadedExpense', downloadedExpenseSchema);

module.exports = DownloadedExpense;
