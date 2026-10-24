import mysql from 'mysql2/promise'

const connString = {
    host : 'localhost',
    port : 3307,
    user : 'root',
    database : 'zenetar',
    password : ''
}
const db = mysql.createPool(connString);
export default db;
