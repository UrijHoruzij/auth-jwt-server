const mongoose = require('mongoose');
const UserModel = require('../models/Users');
const { DB_MONGODB_CONFIG } = require('../config');

/**
 * @module dbMongodb
 */

/**
 * Class function database MongoDB
 */
class dbMongodb {
	/**
	 * Create a dbMongodb
	 * @constructor
	 */
	constructor() {
		this.connection = '';
	}

	/**
	 * Inittialization
	 */
	async init() {
		this.connection = await mongoose.connect(DB_MONGODB_CONFIG.host, DB_MONGODB_CONFIG.config);
		if (this.connection) console.log('Successfully connecting to MongoDB');
	}

	/**
	 * getUserById
	 * @param {string} _id - _id User
	 * @returns {object} User info
	 */
	getUserById = async (_id) => {
		return await UserModel.findById({ _id: _id });
	};

	/**
	 * checkExistUser
	 * @param {string} email - email User
	 * @returns {object} User info
	 */
	checkExistUser = async (email) => {
		return await UserModel.findOne({ email: email });
	};

	/**
	 * addUser
	 * @param {object} data - info User
	 * @returns {object} User info
	 */
	addUser = async (data) => {
		const newUser = new UserModel(data);
		let userSave = await newUser.save();
		return userSave;
	};
}

module.exports = dbMongodb;
