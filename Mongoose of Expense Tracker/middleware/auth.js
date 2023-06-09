const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
  
  User.findById(decoded.userId)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    });
    
};
