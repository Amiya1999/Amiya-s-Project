const express = require('express');
const mongoose=require('mongoose');

const cors = require('cors');//cross site defense. 
//basically a outsider website cannot req anything for security reason.
const helmet = require('helmet');//X-XSS-Protection=says it prevents malicious attacks
//Strict-Transport-Security: This header tells the browser to always use HTTPS to access the site,
// which can help to prevent man-in-the-middle attacks and other types of cyber attacks.
const morgan = require('morgan');// accesslog

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const ForgotPswd = require('./models/forgot');
const DownloadedExpense = require('./models/download');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);// writestream is permission to edit and flags a is permission of appending rather overwritting

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"]
    }
  }));
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "script-src 'self' https://cdnjs.cloudflare.com https://checkout.razorpay.com");
    next();
  });
  
app.use(morgan('combined', { stream: accessLogStream }));

const userRoutes = require('./routes/user');
const expenseRoutes = require('./routes/expense');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premiumFeatures');
const forgotRoutes  = require('./routes/forgot');

app.use('/user', userRoutes);
app.use('/expense', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', forgotRoutes);

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");
    next();
  });

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

mongoose
.connect('mongodb+srv://amiyapradhan1999:Shawack2023@cluster0.vvhthyz.mongodb.net/expenses?retryWrites=true&w=majority')
.then(result=>{
  app.listen(3000);
  console.log('connected');
}).catch(err=>{
  console.log(err);
});