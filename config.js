module.exports = {
	ORIGINS: ['http://localhost:3000', 'http://localhost:3006', 'http://localhost:7000'],
	PORT: 5000,
	DB_TYPE: 'mongodb',
	DB_MYSQL_CONFIG: {
		host: 'localhost',
		user: 'root',
		database: 'usersdb',
		password: 'password',
	},
	DB_MONGODB_CONFIG: {
		host: 'mongodb://localhost/express-jwt',
		config: {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		},
	},
	ACCESS_TOKEN_TIME: '900s',
	REFRESH_TOKEN_TIME: '7d',
	SSO_TOKEN_TIME: '300s',
	SECRET: 'seckret',
	SECRET_REFRESH: 'secretRefresh',
	SSO_TOKEN_SECRET: 'secretSSO',
	COOKIE_CONFIG: { httpOnly: true },
};
