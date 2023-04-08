const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const sequelize = require('./database');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

const Signup = sequelize.define('signups', {
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
    }

});
Expense.sync();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/signup.html'));
});

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

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/login.html'));
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find the user in the signups table based on the email
    Signup.findOne({ where: { email: email } })
        .then(async user => {
            if (!user) {
                // User not found, return error response
                return res.status(404).json({ error: 'User not found' });
            }

            // Compare the provided password with the hashed password stored in the signups table
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                // Incorrect password, return error response
                return res.status(401).json({ error: 'Incorrect password' });
            }else{
                res.redirect("/expense");
            }

            // // Password is correct, return success response
            // res.json({ message: 'Login successful' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.get("/expense", (req,res)=>{
    res.sendFile(path.join(__dirname, '../clientside/expense.html'));
});


app.post("/expense", (req, res) => {
    const expense = req.body.expense;
    const amount = req.body.amount;
    
    Expense.create({
        expense: expense,
        amount: amount
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

app.get("/expenses", (req,res)=>{
    Expense.findAll().then(expenses=>{
    res.json(expenses);
    }).catch(err => {
        console.error('Unable to retrieve expenses:', err);
        res.status(500).send("Error retrieving expenses");
      });
  });



  


app.listen(5000, () => {
    console.log("Working");
});
