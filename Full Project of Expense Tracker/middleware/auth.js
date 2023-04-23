const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();


exports.authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    const user = jwt.verify(token, process.env.TOKEN_SECRET_KEY );
    User.findByPk(user.userId).then(user => {

        req.user = user; 
        next();
    }).catch(err => console.log(err));
}