const cluster = require('./utils/clusters');
const server = require('./server');
const dbConnector = require('./core/db');
const { PORT, CLUSTERS } = require('./config');

const instance = async () => {
	const db = await dbConnector();
	if (!db) {
		throw 'Error! Database not found. ';
	}
	const app = await server(db);
	app.listen(PORT, (err) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(`The server is running: ${PORT} stream ${process.pid}`);
	});
};

try {
	if (CLUSTERS) {
		cluster(instance);
	} else {
		instance();
	}
} catch (error) {
	console.log(error);
}
