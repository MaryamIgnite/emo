import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "sql8.freesqldatabase.com", // Change this if your database is hosted elsewhere
  user: "sql8771105", // Your MySQL username
  password: "L1tlIDmimf", // Your MySQL password
  database: "sql8771105", // Your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
