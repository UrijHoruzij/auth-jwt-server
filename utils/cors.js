const { ORIGINS } = require('../config.js');
/**
 * @module corsMiddleware
 */

/**
 * corsMiddleware
 */
const corsMiddleware = () => {
	return {
		credentials: true,
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);
			if (ORIGINS.indexOf(origin) === -1) {
				return callback(new Error('Cors'), false);
			}
			return callback(null, true);
		},
	};
};
module.exports = corsMiddleware;
