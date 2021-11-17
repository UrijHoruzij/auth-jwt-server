const UserModel = require('../models/Users');

class dbMongodb {
	async getUserById(_id) {
		return await UserModel.findById({ _id: _id });
	}
	async checkExistUser(email) {
		return await UserModel.findOne({ email: email });
	}
	async addUser(data) {
		const newUser = new UserModel(data);
		let userSave = await newUser.save();
		return userSave;
	}
}

module.exports = dbMongodb;
