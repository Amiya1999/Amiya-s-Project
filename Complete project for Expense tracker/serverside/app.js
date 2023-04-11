const express = require('express');
const app = express();
const dotenv=require('dotenv');
dotenv.config();
const Sequelize = require('sequelize');
const sequelize = require('./database');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt=require('jsonwebtoken');
const Razorpay= require('razorpay');



const Signup = sequelize.define('signups', {
    id:{
       type:Sequelize.INTEGER,
       primaryKey:true,
       autoIncrement:true
    },
    fullname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    premium_membership:{
        type:Sequelize.BOOLEAN
    }

});
Signup.sync();

const Login = sequelize.define('logins', {

    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    }

});
Login.sync();


const Expense = sequelize.define('expenses', {

    expense: {
        type: Sequelize.STRING,
        allowNull: false
    },
    amount: {
        type: Sequelize.FLOAT,
        allowNull: true
    },
    signupId:{
        type:Sequelize.INTEGER,
        allowNull:false
    }

});
Expense.sync();

const Order=sequelize.define('order',{
    id:{
        type:Sequelize.INTEGER,
        allownull:false,
        autoIncrement:true,
        primaryKey:true
    },
    paymentid:Sequelize.STRING,
    orderId:Sequelize.STRING,
    status:Sequelize.STRING
});
Order.sync();

//associations
Signup.hasMany(Expense);
Signup.hasMany(Order);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


const authenticate=(req,res,next)=>{
    try{
        const token=req.header('authorization');
        console.log(token);
        const user=jwt.verify(token, 'PRADHAN');
        
        Signup.findByPk(user.Signup.id).then(user=>{
            req.user=user;
            
            next();
    
        })
    }catch(err){
        console.log(err);
        return res.status(401).json({success:false});
    }
}



// app.get("/signup", (req, res) => {
//     res.sendFile(path.join(__dirname, '../clientside/signup.html'));
// });

app.use(express.static(path.join(__dirname, '../public')));  

app.post("/signup", async (req, res) => {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    Signup.create({
        fullname: fullname,
        email: email,
        password: hashedPassword
    })
        .then(results => {
            // Return saved data as JSON response
            res.json(results);
        })
        .then(results => {
            console.log(results);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        })
});

// app.get("/login", (req, res) => {
//     res.sendFile(path.join(__dirname, '../clientside/login.html'));
// });


function generateAcessToken(id){
return jwt.sign({Signup:id}, 'PRADHAN');
};

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        // Find the user in the signups table based on the email
        const user = await Signup.findOne({ where: { email: email } });
        if (!user) {
            // User not found, return error response
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the provided password with the hashed password stored in the signups table
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            // Incorrect password, return error response
            return res.status(401).json({ error: 'Incorrect password' });
        } else {
            return res.json({ message: 'Login successful' , token:generateAcessToken(user)});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get("/expense", (req,res)=>{
    res.sendFile(path.join(__dirname, '../public/expense.html'));
});

app.post("/expense",authenticate, (req, res) => {
    const expense = req.body.expense;
    const amount = req.body.amount;
    
    
    Expense.create({
        expense: expense,
        amount: amount,
        signupId:req.user.id
    })
        .then(results => {
            // Return saved data as JSON response
            res.json(results);
        })
        .then(results => {
            console.log(results);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        })
    
});

// Update an expenditure record
app.put("/expense/:id", (req, res) => {
    const id = req.params.id;
    const expenseName = req.body.expense;
    const expenseAmount = req.body.amount;
  
    Expense.update({
      expense: expenseName,
      amount: expenseAmount
    }, {
      where: {
        id: id
      }
    })
      .then(result => {
        console.log(result);
        res.sendStatus(200);
      })
      .catch(err => {
        console.error('Unable to update record:', err);
        res.status(500).send("Error updating record");
      });
  });
  
  // Delete an expenditure record
  app.delete("/expense/:id", (req, res) => {
    const id = req.params.id;
  
    Expense.destroy({
      where: {
        id: id
      }
    })
      .then(result => {
        console.log(result);
        res.sendStatus(200);
      })
      .catch(err => {
        console.error('Unable to delete record:', err);
        res.status(500).send("Error deleting record");
      });
  });

app.get("/expenses", authenticate, (req,res) => {

    Expense.findAll({where:{signupId:req.user.id}}).then(expenses=>{
    res.json(expenses);
    }).catch(err => {
        console.error('Unable to fetch expenses:', err);
        res.status(500).json({ error: 'Internal server error' });
    });
});

app.get("/purchase",authenticate,async (req,res)=>{
       
        var rzp= new Razorpay({
            key_id : process.env.RAZORPAY_KEY_ID,
            key_secret : process.env.RAZORPAY_KEY_SECRET
        });
        
         const amount=2000;
        const orderid=await rzp.orders.create({amount,currency: 'INR'}
    ); const signupId=req.user.id;
       const orderIId=orderid.id;
       Order.create({orderId:orderIId,signupId:signupId, status:"PENDING"}).then(()=>{
            return res.status(201).json({order_id:orderid,key_id:rzp.key_id});
        }).catch(err=>{
            console.log(err)
        })

});

app.post("/purchase/update",authenticate,async(req,res)=>{
const {payment_id,order_id}=req.body;

await Order.findOne({where:{orderId:order_id}}).then(order=>{
    order.update({paymentid:payment_id, status:"SUCCESSFUL"}).then(()=>{
    req.user.update({premium_membership:true,message:"Transaction Successful"});
    }).catch((err)=>{
      throw new Error(err);
    })
})

// await Order.findOne({where:{orderId:{[Sequelize.Op.ne]: order_id}}}).then(order=>{
//     order.update({paymentid:payment_id, status:"FAILED"}).then(()=>{
//     req.user.update({premium_membership:false,message:"Transaction Failed"});
//     }).catch((err)=>{
//       throw new Error(err);
//     })
// }).catch((err)=>{
//     throw new Error(err);
//   })
}
)

sequelize.sync().then(app.listen(5000, () => {
    console.log("Working");
})).catch(err=>console.log(err));


