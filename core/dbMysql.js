const mysql = require('mysql2/promise');
const { DB_MYSQL_CONFIG } = require('../config.js');

/**
 * @module dbMysql
 */

/**
 * Class function database Mysql.
 */
class dbMysql {
	/**
	 * Create a dbMysql
	 * @constructor
	 */
	constructor() {
		this.connection = '';
	}

	/**
	 * Inittialization
	 */
	async init() {
		this.connection = await mysql.createConnection({
			host: DB_MYSQL_CONFIG.host,
			user: DB_MYSQL_CONFIG.user,
			database: DB_MYSQL_CONFIG.database,
		});
		this.connection.query(this.createTable());
	}

	/**
	 * getUserById
	 * @param {string} _id - _id User
	 * @returns {object} User info
	 */
	async getUserById(_id) {
		[rows, fields] = await this.connection.query(`SELECT * FROM Users WHERE _id=${_id}`);
		return rows;
	}

	/**
	 * checkExistUser
	 * @param {string} email - email User
	 * @returns {object} User info
	 */
	async checkExistUser(email) {
		[rows, fields] = await this.connection.query(`SELECT * FROM Users WHERE email=${email}`);
		return rows;
	}

	/**
	 * addUser
	 * @param {object} data - info User
	 * @returns {object} User info
	 */
	async addUser(data) {
		const result = await this.connection.query(
			`INSERT INTO Users (email,password,name,lastname) VALUES (${data.email}, ${data.password}, ${data.name},${data.lastname});`,
		);
		return result[0];
	}

	/**
	 * createTable
	 * @returns {string} Query SQL
	 */
	createTable() {
		return `CREATE TABLE IF NOT EXISTS Users (
			_id INT AUTO_INCREMENT PRIMARY KEY,
			email VARCHAR(120) NOT NULL UNIQUE,
			password VARCHAR(120) NOT NULL,
			name VARCHAR(30) NOT NULL,
			lastname VARCHAR(60) NOT NULL,
		);`;
	}
}

module.exports = dbMysql;
