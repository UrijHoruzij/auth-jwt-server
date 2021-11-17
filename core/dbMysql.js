class dbMysql {
	constructor(connection) {
		this.connection = connection;
		this.createTable();
	}
	async getUserById(_id) {
		return ([rows, fields] = await this.connection.execute(`SELECT * FROM Users WHERE _id=${_id}`));
	}
	async checkExistUser(email) {
		return ([rows, fields] = await this.connection.execute(`SELECT * FROM Users WHERE email=${email}`));
	}
	async addUser(data) {
		return ([rows, fields] = await this.connection.execute(
			`INSERT INTO Users (email,password,name,lastname) VALUES (${data.email}, ${data.password}, ${data.name},${data.lastname});`,
		));
	}

	createTable() {
		`CREATE TABLE IF NOT EXISTS Users (
			_id INT AUTO_INCREMENT PRIMARY KEY,
			email VARCHAR(120) NOT NULL UNIQUE,
			password VARCHAR(120) NOT NULL,
			name VARCHAR(30) NOT NULL,
			lastname VARCHAR(60) NOT NULL,
		);`;
	}
}

module.exports = dbMysql;
