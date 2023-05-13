const express = require('express');

const signup_loginController = require('../controllers/signup_login');

const router = express.Router();

router.get('/signup', signup_loginController.getSignupPage);
router.post('/signup', signup_loginController.postSignup);

router.get('/login', signup_loginController.getLoginPage);
router.post('/login', signup_loginController.postLogin);

module.exports = router;