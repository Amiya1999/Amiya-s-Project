const Sib = require('sib-api-v3-sdk');
require('dotenv').config();
const ForgotPswd = require('../models/forgot');
const User = require('../models/user');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

exports.forgotPswd = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      const id = uuid.v4();
      await ForgotPswd.create({ id, isActive: true, userId: user.id });

      const client = new Sib.SMTPApi();

      const apiKey = process.env.SIB_API_KEY;
      client.setApiKey(apiKey);

      const sender = { email: 'amiyapradhan1999@gmail.com' };

      const recievers = [
        {
          email: email
        }
      ];

      const sendSmtpEmail = {
        to: recievers,
        templateId: 1,
        params: {
          resetLink: `http://localhost:3000/password/resetpassword/${id}`
        }
      };

      await client.sendTransacEmail(sendSmtpEmail);

      res.status(200).json({ message: 'Reset link sent to your email', success: true });
    } else {
      throw new Error('User does not exist');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err, success: false });
  }
};

exports.resetPswd = async (req, res, next) => {
  try {
    const reqId = req.params.id;
    const request = await ForgotPswd.findOne({ id: reqId });
    if (request && request.id === reqId) {
      await request.update({ isActive: false });

      res.status(200).send(`
        <html>
          <form action="/password/updatepassword/${reqId}" method="post">
            <label for="newpassword">Enter New Password</label>
            <input name="newpassword" type="password" required></input>
            <button type="submit">Reset password</button>
          </form>
        </html>
      `);
    } else {
      throw new Error('Something went wrong!, resend your mail');
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
};

exports.updatepassword = async (req, res, next) => {
  try {
    const { newpassword } = req.body;
    const { updateId } = req.params;
    const request = await ForgotPswd.findOne({ id: updateId });
    if (!request) {
      throw new Error('Invalid request ID');
    }
    const user = await User.findOne({ id: request.userId });

    if (!newpassword) {
      return res.status(400).json({ error: 'Password is required', success: false });
    }

    if (user) {
      const saltRounds = 10;
      bcrypt.hash(newpassword, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err);
          throw new Error(err);
        }
        await user.update({ password: hash });
        res.status(201).json({ message: 'New password updated successfully!' });
      });
    } else {
      res.status(404).json({ error: 'No user exists', success: false });
    }
  } catch (err) {
    console.log(err);
    return res.status(403).json({ err, success: false });
  }
};
