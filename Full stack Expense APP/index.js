const express = require('express');
const app = express();
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('./database');
const bodyParser = require('body-parser');

// Define the expenditures model
const Expenditure = sequelize.define('expenditures', {
  expense: {
    type: Sequelize.STRING,
    allowNull: false
  },
  amount: {
    type: Sequelize.FLOAT,
    allowNull: false
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

// Serve the HTML page for creating an expenditure
app.get("/expense", (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

// Create a new expenditure record
app.post("/expense", (req, res, next) => {
  const expenseName = req.body.expense;
  const expenseAmount = req.body.amount;
  
  Expenditure.create({
    expense: expenseName,
    amount: expenseAmount
  })
    .then(result => {
      console.log(result);
      res.json(result);
    })
    .catch(err => {
      console.error('Unable to create record:', err);
      res.status(500).send("Error creating record");
    });
});



// Update an expenditure record
app.put("/expense/:id", (req, res) => {
  const id = req.params.id;
  const expenseName = req.body.expense;
  const expenseAmount = req.body.amount;

  Expenditure.update({
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

  Expenditure.destroy({
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

Expenditure.sync()
  .then(() => {
    console.log('Database connection successful. Expenditures table created or updated.');
    app.listen(5000, () => {
      console.log("Working");
    });
  })
  .catch(err => {
    console.log(err);
  });
