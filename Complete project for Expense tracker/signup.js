const express=require('express');
const app=express();
const Sequelize=require('sequelize');
const sequelize=require('./database');
const bodyParser = require('body-parser');
const path=require('path');

const Signup = sequelize.define('signups', {
    fullname: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password:{
      type:Sequelize.STRING,
      allowNull:true
    }

  });
  Signup.sync();



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, '../clientside/signup.html'));
  });



  app.post("/signup",(req,res)=>{
    const fullname= req.body.fullname;
    const email =req.body.email;
    const password =req.body.password;
   
   Signup.create({ 
    fullname:fullname,
    email:email,
    password:password
})
.then(results => {
    // Return saved data as JSON response
    res.json(results);
})
.then(results=>{
    console.log(results);
})
.catch(err => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
})
});



Signup.sync()
  .then(() => {
    app.listen(5000, () => {
      console.log("Working");
    });
  })
  .catch(err => {
    console.log(err);
  });
