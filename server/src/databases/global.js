import mysql from "mysql";
import * as util from "util";

const pool = mysql.createPool({
	connectionLimit: 20,
	host: "127.0.0.1",
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME_GLOBAL
});

pool.getConnection((err, connection) => {
	if (err) {
		console.log(err)
		if (err.code === "PROTOCOL_CONNECTION_LOST") {
			console.error("Database connection was closed.");
		}
		if (err.code === "ER_CON_COUNT_ERROR") {
			console.error("Database has too many connections.");
		}
		if (err.code === "ECONNREFUSED") {
			console.error("Database connection was refused.");
		}
	}

	if (connection) connection.release();
	return;
});

pool.query = util.promisify(pool.query);

export default pool;
