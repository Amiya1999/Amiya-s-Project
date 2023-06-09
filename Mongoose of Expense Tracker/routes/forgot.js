const express = require('express');
const router = express.Router();

const forgotControllers = require('../controllers/forgot');

router.use('/forgotpassword', forgotControllers.forgotPswd);
router.get('/resetpassword/:id', forgotControllers.resetPswd);
router.get('/updatepassword/:updateId', forgotControllers.updatepassword);

module.exports = router;