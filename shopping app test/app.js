const express = require('express');
const Sequelize = require('sequelize');
const sequelize = require('./database');
const app = express();
const bodyParser = require('body-parser');
const path=require('path');

const Cart = sequelize.define('carts', {
    item: {
      type: Sequelize.STRING,
      allowNull: false
    },
    amount: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    category:{
      type:Sequelize.STRING,
      allowNull:true
    }

  });
  Cart.sync();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get("/shop", (req, res) => {
    res.sendFile(path.join(__dirname, './app.html'));
  });

app.post("/shop",(req,res)=>{
    const item= req.body.item;
    const amount =req.body.amount;
    const category =req.body.category;
Cart.create({ 
    item:item,
    amount:amount,
    category:category 
})
.then(results => {
    // Return saved data as JSON response
    res.json(results);
})
.catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
})
});

app.get("/carts",(req,res)=>{
    Cart.findAll().then(cart => {
        res.json(cart);
      })
      .catch(err => {
        console.error('Unable to retrieve cart info:', err);
        res.status(500).send("Error retrieving cart info");
      });
});

Cart.sync()
  .then(() => {
    app.listen(5000, () => {
      console.log("Working");
    });
  })
  .catch(err => {
    console.log(err);
  });
