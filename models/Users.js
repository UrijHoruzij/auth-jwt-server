const mongoose = require('mongoose');
const UsersSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	// veficated: {
	// 	type: Boolean,
	// 	required: true,
	// },
	name: {
		type: String,
		required: true,
	},
	lastname: {
		type: String,
		required: true,
	},
});

module.exports = Users = mongoose.model('Users', UsersSchema);
