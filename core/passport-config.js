const { Strategy, ExtractJwt } = require('passport-jwt');
const { SECRET } = require('../config');

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: SECRET,
};

module.exports = (passport, database) => {
	passport.use(
		new Strategy(opts, async (payload, done) => {
			const user = database.getUserById(payload.id);
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
