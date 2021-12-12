const os = require('os');
const cluster = require('cluster');

/**
 * @module clusterServer
 */

/**
 * clusterServer
 * @param {object} server - server
 */
const clusterServer = (server) => {
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
};

module.exports = clusterServer;
