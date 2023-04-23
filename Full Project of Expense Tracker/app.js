const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const sequelize = require('./util/database');
dotenv.config();

const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const ForgotPswd = require('./models/forgot');
const DownloadedExpense = require('./models/download');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);

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

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPswd);
ForgotPswd.belongsTo(User);

User.hasMany(DownloadedExpense);
DownloadedExpense.belongsTo(User);

sequelize.sync()  //{force: true}
.then(result => {
    app.listen(process.env.PORT || 3000);
})
.catch(err => console.log(err));