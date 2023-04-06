const Sequelize=require('sequelize');

const sequelize=new Sequelize(
    'shopdb',
    'root',
    'Shawack@1999',
    {
        dialect: 'mysql',
    host: 'localhost'
    }
);
module.exports = sequelize;