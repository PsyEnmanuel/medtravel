import mysql from "mysql";
import * as util from "util";

const pool = mysql.createPool({
	connectionLimit: 20,
	host: "127.0.0.1",
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
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

async function uppercaseAllTextColumnsInAllTables() {
	const dbName = pool.config.connectionConfig.database;

	try {
		const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
        AND table_type = 'BASE TABLE';
    `, [dbName]);

		for (const table of tables) {
			if (table.TABLE_NAME === 't_file') {
				continue;
			}
			const columns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = ? 
          AND table_name = ? 
          AND data_type IN ('varchar', 'text', 'char');
      `, [dbName, table.TABLE_NAME]);

			if (columns.length === 0) continue;

			const setClause = columns
				.map((column) => `\`${column.COLUMN_NAME}\` = UPPER(\`${column.COLUMN_NAME}\`)`)
				.join(', ');
			const updateSql = `UPDATE \`${table.TABLE_NAME}\` SET ${setClause};`;

			const result = await pool.query(updateSql);
			console.log(`✅ ${table.TABLE_NAME}: Updated ${result.affectedRows} rows.`);
		}

		console.log('🔁 All applicable tables processed.');
	} catch (err) {
		console.error('❌ Error:', err.message);
	}
}

async function lowerAllTextColumnsInAllTables() {
	const dbName = pool.config.connectionConfig.database;

	try {
		const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ?
        AND table_type = 'BASE TABLE';
    `, [dbName]);

		for (const table of tables) {
			if (table.TABLE_NAME === 't_file') {
				continue;
			}
			const columns = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = ? 
          AND table_name = ? 
          AND data_type IN ('text');
      `, [dbName, table.TABLE_NAME]);

			if (columns.length === 0) continue;

			const setClause = columns
				.map((column) => `\`${column.COLUMN_NAME}\` = UPPER(\`${column.COLUMN_NAME}\`)`)
				.join(', ');
			const updateSql = `UPDATE \`${table.TABLE_NAME}\` SET ${setClause};`;

			const result = await pool.query(updateSql);
			console.log(`✅ ${table.TABLE_NAME}: Updated ${result.affectedRows} rows.`);
		}

		console.log('🔁 All applicable tables processed.');
	} catch (err) {
		console.error('❌ Error:', err.message);
	}
}

// lowerAllTextColumnsInAllTables();

export default pool;
