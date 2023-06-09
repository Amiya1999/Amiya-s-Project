const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function isStringInvalid(string) {
  if (string == undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (isStringInvalid(name) || isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ err: 'Something is missing!' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = new User({
        name,
        email,
        password: hashedPassword
      });

      await user.save();
      res.status(201).json({ message: 'Successfully Signed Up' });
    } catch (err) {
      console.log(err);
      return res.status(403).json({ err: 'User already exists!' });
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};

const generateAccessToken = (id, ispremiumuser) => {
  return jwt.sign({ userId: id, ispremiumuser }, process.env.TOKEN_SECRET_KEY);
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({ err: 'Email or Password is missing!' });
    }

    try {
      const user = await User.findOne({ email });

      if (user) {
        const result = await bcrypt.compare(password, user.password);

        if (result) {
          res.status(200).json({
            success: true,
            message: 'Logged in Successfully!',
            token: generateAccessToken(user._id, user.ispremiumuser)
          });
        } else {
          return res.status(401).json({ success: false, message: 'Password is incorrect!' });
        }
      } else {
        return res.status(404).json({ success: false, message: 'User not found!' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err, success: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err, success: false });
  }
};

module.exports = {
  signUp,
  login,
  generateAccessToken
};
