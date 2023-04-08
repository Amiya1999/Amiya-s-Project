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
            }

            // Password is correct, return success response
            res.json({ message: 'Login successful' });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.listen(5000, () => {
    console.log("Working");
});
