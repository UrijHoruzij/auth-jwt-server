class dbMysql {
	constructor(connection) {
		this.connection = connection;
		this.connection.query(this.createTable());
	}
	async getUserById(_id) {
		[rows, fields] = await this.connection.query(`SELECT * FROM Users WHERE _id=${_id}`);
		return rows;
	}
	async checkExistUser(email) {
		[rows, fields] = await this.connection.query(`SELECT * FROM Users WHERE email=${email}`);
		return rows;
	}
	async addUser(data) {
		const result = await this.connection.query(
			`INSERT INTO Users (email,password,name,lastname) VALUES (${data.email}, ${data.password}, ${data.name},${data.lastname});`,
		);
		return result[0];
	}

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
