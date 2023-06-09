const express = require('express');
const router = express.Router();

const premiumFeaturesController = require('../controllers/premiumFeatures');
const userAuthentication = require('../middleware/auth');

router.get('/showleaderboard', userAuthentication.authenticate, premiumFeaturesController.getUserLeaderboard);

module.exports = router;