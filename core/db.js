const mysql = require('mysql2');
const mongoose = require('mongoose');
const { DB_TYPE, DB_MYSQL_CONFIG, DB_MONGODB_CONFIG } = require('../config');

const db = {};
db.connect = async () => {
	try {
		let connect;
		switch (DB_TYPE) {
			case 'mysql':
				connect = mysql.createConnection(DB_MYSQL_CONFIG);
				if (connect) console.log('Successfully connecting to Mysql');
			case 'mongodb':
				connect = await mongoose.connect(DB_MONGODB_CONFIG.host, DB_MONGODB_CONFIG.config);
				if (connect) console.log('Successfully connecting to MongoDB');
			default:
				connect = await mongoose.connect(DB_MONGODB_CONFIG.host, DB_MONGODB_CONFIG.config);
				if (connect) console.log('Successfully connecting to MongoDB');
		}
	} catch {
		console.error('Database connection error');
	}
};

module.exports = db;
