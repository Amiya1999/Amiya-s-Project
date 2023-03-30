const mysql=require('mysql2');

const pool=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'Shawack@1999',
    database:'appointmentdb'
});

module.exports=pool.promise();