const { Strategy, ExtractJwt } = require('passport-jwt');
const { SECRET } = require('../config.js');

/**
 * @module JWTStrategy
 */

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: SECRET,
};

/**
 * JWTStrategy
 * @param {object} app - fastify
 * @param {object} passport - passport
 * @returns {object} passport strategy
 */
const JWTStrategy = (app, passport) => {
	passport.use(
		'jwt',
		new Strategy(opts, async (payload, done) => {
			const user = app.db.client.getUserById(payload._id);
			if (user) {
				return done(null, {
					_id: user._id,
					name: user.name,
					lastname: user.lastname,
				});
			} else {
				return done(null, false);
			}
		}),
	);
};

module.exports = JWTStrategy;
