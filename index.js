const express = require('express');
const expressWs = require('express-ws');
const { graphqlHTTP } = require('express-graphql');
const passport = require('passport');
const os = require('os');
const cluster = require('cluster');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const db = require('./core/db');
const { PORT, SHOW_GRAPHIQL } = require('./config');
const logger = require('./utils/logger');
const cors = require('./utils/cors');
const schema = require('./utils/schema');

const server = () => {
	const app = express();
	expressWs(app);
	const database = db.connect();
	app.use(logger());
	app.use(cors());
	app.use(compression());
	app.use(passport.initialize());
	require('./core/passport-config')(passport, database);
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());
	app.use(cookieParser());

	const authClass = require('./controllers/auth');
	const auth = new authClass(database);

	const authGraphqlClass = require('./controllers/authGraphql');
	const authGraphql = new authGraphqlClass(database);

	const root = {
		verify: ({ input }) => {
			return authGraphql.verify(input);
		},
		signinSSO: ({ input }, { res }) => {
			return authGraphql.signinSSO(input, res);
		},
		signup: ({ input }) => {
			return authGraphql.signup(input);
		},
		signin: ({ input }, { res }) => {
			return authGraphql.signin(input, res);
		},
		refresh: ({ input }, { req, res }) => {
			return authGraphql.refresh(input, req, res);
		},
		logout: ({ input }, { res }) => {
			return authGraphql.logout(input, res);
		},
	};

	app.use(
		'/graphql',
		graphqlHTTP((req, res) => ({
			graphiql: SHOW_GRAPHIQL,
			schema,
			rootValue: root,
			context: { req, res },
		})),
	);
	app.post('/signup', (req, res) => {
		auth.signup(req, res);
	});
	app.post('/signin', (req, res) => {
		auth.signin(req, res);
	});
	app.post('/refresh', (req, res) => {
		auth.refresh(req, res);
	});
	app.post('/signinSSO', (req, res) => {
		auth.signinSSO(req, res);
	});
	app.post('/verify', (req, res) => {
		auth.verify(req, res);
	});
	app.post('/logout', (req, res) => {
		auth.logout(req, res);
	});

	app.ws('/', function (ws, req) {
		ws.on('signup', function (msg) {
			console.log(msg);
		});
		ws.on('signin', function (msg) {
			console.log(msg);
		});
		ws.on('refresh', function (msg) {
			console.log(msg);
		});
		ws.on('signinSSO', function (msg) {
			console.log(msg);
		});
		ws.on('verify', function (msg) {
			console.log(msg);
		});
		ws.on('logout', function (msg) {
			console.log(msg);
		});
	});

	app.listen(PORT, () => {
		console.log(`The server is running: ${PORT} stream ${process.pid}`);
	});
};

const clusterWorkerSize = os.cpus().length;
if (clusterWorkerSize > 1) {
	if (cluster.isMaster) {
		for (let i = 0; i < clusterWorkerSize - 1; i++) {
			cluster.fork();
		}
		cluster.on('exit', (worker) => {
			console.log('Worker', worker.id, ' has exitted.');
			cluster.fork();
		});
	} else {
		server();
	}
} else {
	server();
}
