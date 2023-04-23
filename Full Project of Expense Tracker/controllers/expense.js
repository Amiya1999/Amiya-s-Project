const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../util/database');
const ExpenseService = require('../services/expenseServices');
const s3service = require('../services/s3services');
const DownloadedExpense = require('../models/download');

exports.downloadExpense = async (req, res, next) => {
    try {
        const expenses = await ExpenseService.getExpenses(req);
        const stringifiedExpenses = JSON.stringify(expenses);
        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await s3service.uploadToS3(stringifiedExpenses, filename);
        const saveTodb = await DownloadedExpense.create({ fileURL });
        res.status(200).json({ success: true, fileURL });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, err });
    }
}

exports.downloadedExpense = async (req, res, next) => {
    try {
        const downloadedExpenseData = await req.user.getDownloadedExpenses();
        res.status(201).json({ success: true, downloadedExpenseData });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, err });
    }
}

exports.addExpense = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { exAmount, description, category } = req.body;

        if (exAmount == undefined || exAmount.length === 0) {
            return res.status(400).json({ success: false, message: 'Parameters missing!' });
        }
        const newExpense = await User.create({ exAmount, description, category }, { transaction: t });

        const totalExpense = Number(req.user.totalExpenses) + Number(exAmount);
        await User.update({ totalExpenses: totalExpense }, { where: { id: req.user.id }, transaction: t });

        await t.commit();

        res.status(201).json({ newExpense, success: true });
    } catch (err) {
        await t.rollback();
        console.log(err);
        return res.status(500).json({ success: false, error: err });
    }
};

exports.getExpense = async (req, res, next) => {
    try {
        const EXPENSES_PER_PAGE = parseInt(req.query.rowPerPage);
        const totalExpense = await req.user.countExpenses();
        const page = req.query.page || 1;

        const allExpense = await Expense.findAll({ where: { userId: req.user.id }, offset: (page - 1) * EXPENSES_PER_PAGE, limit: EXPENSES_PER_PAGE });

        res.status(200).json({
            allExpense, success: true,
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
    const t = await sequelize.transaction();
    try {
        const expenseId = req.params.id;

        if (expenseId == undefined || expenseId.length === 0) {
            return res.status(400).json({ success: false });
        }

        const deletedExpense = await Expense.findOne({ where: { id: expenseId, userId: req.user.id } });
        if (!deletedExpense) {
            return res.status(404).json({ success: false, message: 'This Expense doesnt belongs to the user' });
        }

        await Expense.destroy({ where: { id: expenseId, userId: req.user.id } }, { transaction: t });

        const totalExpense = Number(req.user.totalExpenses) - Number(deletedExpense.exAmount);
        await User.update({ totalExpenses: totalExpense }, { where: { id: req.user.id }, transaction: t });

        await t.commit();

        res.status(200).json({ success: true, message: 'Successfully deleted!' });
    } catch (err) {
        await t.rollback();
        console.log(err);
        return res.status(500).json({ success: false, message: 'Failed!' });
    }
}