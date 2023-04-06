const express = require('express');
const Sequelize = require('sequelize');
const sequelize = require('./database');
const app = express();
const bodyParser = require('body-parser');
const path=require('path');

const Orders= sequelize.define('orders', {
    dish: {
      type: Sequelize.STRING,
      allowNull: false
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false
    },
    counter:{
      type:Sequelize.STRING,
      allowNull:false
    }

  });
  Orders.sync();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get("/order", (req, res) => {
    res.sendFile(path.join(__dirname, './app.html'));
  });

app.post("/order",(req,res)=>{
    const dish= req.body.dish;
    const price =req.body.price;
    const counter =req.body.counter;
Orders.create({ 
    dish:dish,
    price:price,
    counter:counter 
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

app.get("/orders",(req,res)=>{
    Orders.findAll().then(order=> {
        res.json(order);
      })
      .catch(err => {
        console.error('Unable to retrieve order info:', err);
        res.status(500).send("Error retrieving order info");
      });
});

Orders.sync()
  .then(() => {
    app.listen(5000, () => {
      console.log("Working");
    });
  })
  .catch(err => {
    console.log(err);
  });
