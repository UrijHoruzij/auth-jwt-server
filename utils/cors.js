const cors = require('cors');
const { ORIGINS } = require('../config');
const corsMiddleware = () => {
	return cors({
		credentials: true,
		origin: function (origin, callback) {
			if (!origin) return callback(null, true);
			if (ORIGINS.indexOf(origin) === -1) {
				return callback(new Error('Cors'), false);
			}
			return callback(null, true);
		},
	});
};

module.exports = corsMiddleware;
