const express = require('express');
const passport = require('passport');
const os = require('os');
const cluster = require('cluster');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const db = require('./core/db');
const { PORT } = require('./config');
const logger = require('./utils/logger');
const cors = require('./utils/cors');

const server = () => {
	const app = express();
	db.connect();
	app.use(logger());
	app.use(cors());
	app.use(compression());
	app.use(passport.initialize());
	require('./core/passport-config')(passport);
	app.use(express.urlencoded({ extended: false }));
	app.use(express.json());
	app.use(cookieParser());

	const authClass = require('./controllers/auth');
	const auth = new authClass();

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
