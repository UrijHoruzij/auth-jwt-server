const dbMysql = require('./dbMysql');
const dbMongodb = require('./dbMongodb');
const { DB_TYPE } = require('../config');

/**
 * @module dbconnector
 */

/**
 * Dbconnector
 * @returns {object} database
 */
const dbconnector = async () => {
	try {
		let database;
		switch (DB_TYPE) {
			case 'mysql':
				database = new dbMysql();
				await database.init();
				return database;
			case 'mongodb':
				database = new dbMongodb();
				await database.init();
				return database;
			default:
				database = new dbMongodb();
				await database.init();
				return database;
		}
	} catch (error) {
		console.error('Database connection error');
	}
};
module.exports = dbconnector;
