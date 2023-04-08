const Sequelize=require('sequelize');

const sequelize=new Sequelize(
    'expensedb',
    'root',
    'Shawack@1999',{
        host:'localhost',
        dialect:'mysql'
    }
);

module.exports=sequelize;