const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  'trackerdb', // Replace with the name of your database
  'root', // Replace with your MySQL username
  'Shawack@1999', // Replace with your MySQL password
  {
    dialect: 'mysql',
    host: 'localhost'
  }
);

module.exports = sequelize;
