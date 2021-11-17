const mysql = require('mysql2/promise');
const mongoose = require('mongoose');
const dbMysql = require('./dbMysql');
const dbMongodb = require('./dbMongodb');
const { DB_TYPE, DB_MYSQL_CONFIG, DB_MONGODB_CONFIG } = require('../config');

const db = {};
db.connect = async () => {
	try {
		let connect;
		switch (DB_TYPE) {
			case 'mysql':
				connect = await mysql.createConnection(DB_MYSQL_CONFIG);
				if (connect) console.log('Successfully connecting to Mysql');
				return new dbMysql(connect);
			case 'mongodb':
				connect = await mongoose.connect(DB_MONGODB_CONFIG.host, DB_MONGODB_CONFIG.config);
				if (connect) console.log('Successfully connecting to MongoDB');
				return new dbMongodb();
			default:
				connect = await mongoose.connect(DB_MONGODB_CONFIG.host, DB_MONGODB_CONFIG.config);
				if (connect) console.log('Successfully connecting to MongoDB');
				return new dbMongodb();
		}
	} catch {
		console.error('Database connection error');
	}
};

module.exports = db;
