const authClass = require('../../controllers/auth');
/**
 * @module authRoutes
 */

/**
 * authRoutes
 */
const authRoutes = (app, opts, done) => {
	const auth = new authClass(app.db);
	// , { preValidation: fastifyPassport.authenticate('jwt') }
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
	done();
};

module.exports = authRoutes;
