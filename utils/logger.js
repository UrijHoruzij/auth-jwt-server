const morgan = require('morgan');
const logger = () => {
	return morgan((tokens, req, res) => {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, 'content-length'),
			'-',
			tokens['response-time'](req, res),
			'ms',
			process.pid,
			'id',
		].join(' ');
	});
};

module.exports = logger;
