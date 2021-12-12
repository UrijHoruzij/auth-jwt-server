const fastify = require('fastify');
const cors = require('fastify-cors');
const cookies = require('fastify-cookie');
const passport = require('fastify-passport');
const fastifySecureSession = require('fastify-secure-session');
const mercurius = require('mercurius');
const fs = require('fs');
const path = require('path');
const passportConfig = require('./core/passport-config');
const corsOptions = require('./utils/cors');
const schema = require('./utils/schema');
const apiV2 = require('./routes/v2/auth');
const authGraphqlClass = require('./controllers/authGraphql');

/**
 * @module Server
 */

/**
 * Server
 * @param {object} db - connection database
 * @returns {object} fastify
 */
const server = (db) => {
	const app = fastify();
	app.decorate('db', db);
	app.register(cors, corsOptions);
	app.register(fastifySecureSession, { key: fs.readFileSync(path.join(__dirname, 'secret-key')) });
	app.register(passport.initialize());
	app.register(passport.secureSession());
	passportConfig(app, passport);
	app.register(apiV2, { prefix: '/api/v2' });
	const authGraphql = new authGraphqlClass(app.db);
	const resolvers = {
		Query: {
			me: async () => {
				return 'me';
			},
		},
		Mutation: {
			verify: async ({ input }) => {
				return authGraphql.verify(input);
			},
			signinSSO: async (_, { input }, { res }) => {
				return authGraphql.signinSSO(input, res);
			},
			signup: async ({ input }) => {
				return authGraphql.signup(input);
			},
			signin: async (_, { input }, { res }) => {
				return authGraphql.signin(input, res);
			},
			refresh: async (_, { input }, { req, res }) => {
				return authGraphql.refresh(input, req, res);
			},
			logout: async (_, { input }, { res }) => {
				return authGraphql.logout(input, res);
			},
		},
	};
	app.register(mercurius, {
		schema,
		resolvers,
		graphiql: true,
		context: (req, res) => ({ req, res }),
	});

	return app;
};
module.exports = server;
