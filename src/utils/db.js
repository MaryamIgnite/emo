import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost", // Change this if your database is hosted elsewhere
  user: "root", // Your MySQL username
  password: "Temp/2109", // Your MySQL password
  database: "meo", // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
