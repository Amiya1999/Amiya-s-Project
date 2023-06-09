const Expense = require('../models/expense');
const User = require('../models/user');
const s3service = require('../services/s3services');
const DownloadedExpense = require('../models/download');

// const getExpenses = async (req, where) => {
//   return req.user.getExpenses(where);
// };


exports.downloadExpense = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id });
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id;
    const filename = `Expense${userId}/${new Date()}.txt`;
    const fileURL = await s3service.uploadToS3(stringifiedExpenses, filename);
    const saveTodb = await DownloadedExpense.create({ fileURL, userId: req.user.id });
    res.status(200).json({ success: true, fileURL });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, err });
  }
};

exports.downloadedExpense = async (req, res, next) => {
  try {
    const downloadedExpenseData = await DownloadedExpense.find({ userId: req.user.id });
    res.status(201).json({ success: true, downloadedExpenseData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, err });
  }
};

exports.addExpense = async (req, res, next) => {
  try {
    const { exAmount, description, category } = req.body;

    if (!exAmount || exAmount.length === 0) {
      return res.status(400).json({ success: false, message: 'Parameters missing!' });
    }

    const newExpense = new Expense({
      exAmount,
      description,
      category,
      user: req.user.id
    });
    await newExpense.save();
    req.user.totalExpenses += Number(exAmount);
    await req.user.save();

    res.status(201).json({ newExpense, success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const EXPENSES_PER_PAGE = parseInt(req.query.rowPerPage);
    const totalExpense = await Expense.countDocuments({ user: req.user.id });
    const page = req.query.page || 1;

    const allExpense = await Expense.find({ user: req.user.id })
      .skip((page - 1) * EXPENSES_PER_PAGE)
      .limit(EXPENSES_PER_PAGE);

    res.status(200).json({
      allExpense,
      success: true,
      currentPage: page,
      hasNextPage: EXPENSES_PER_PAGE * page < totalExpense,
      nextPage: parseInt(page) + 1,
      hasPrevPage: page > 1,
      prevPage: page - 1,
      lastPage: Math.ceil(totalExpense / EXPENSES_PER_PAGE)
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, error: err });
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;

    if (!expenseId || expenseId.length === 0) {
      return res.status(400).json({ success: false });
    }

    const deletedExpense = await Expense.findOneAndDelete({ _id: expenseId, user: req.user.id });

    if (!deletedExpense) {
      return res
        .status(404)
        .json({ success: false, message: 'This Expense does not belong to the user' });
    }

    req.user.totalExpenses -= Number(deletedExpense.exAmount);
    await req.user.save();

    res.status(200).json({ success: true, message: 'Successfully deleted!' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Failed!' });
  }
};
