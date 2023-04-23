const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expense');
const userAuthentication = require('../middleware/auth');

router.post('/add-expense', userAuthentication.authenticate, expenseController.addExpense);
router.get('/get-expense', userAuthentication.authenticate, expenseController.getExpense);
router.delete('/delete-expense/:id', userAuthentication.authenticate, expenseController.deleteExpense);

router.get('/download', userAuthentication.authenticate, expenseController.downloadExpense);
router.get('/downloaded-expense', userAuthentication.authenticate, expenseController.downloadedExpense);

module.exports = router;