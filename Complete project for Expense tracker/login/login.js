const express=require('express');
const app=express();
const Sequelize=require('sequelize');
const sequelize=require('./database');
const bodyParser = require('body-parser');
const path=require('path');

const Login = sequelize.define('logins', {
  
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password:{
      type:Sequelize.STRING,
      allowNull:true
    }

  });
  Login.sync();



app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, './htmlcss/login.html'));
  });



  app.post("/login",(req,res)=>{
    const email =req.body.email;
    const password =req.body.password;
   
   Login.create({ 
    
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



Login.sync()
  .then(() => {
    app.listen(5000, () => {
      console.log("Working");
    });
  })
  .catch(err => {
    console.log(err);
  });
