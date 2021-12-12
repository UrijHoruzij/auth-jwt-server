const supertest = require('supertest');
const server = require('../server');
const dbConnector = require('../core/db');

let data = {};
let fastify;
jest.setTimeout(30000);
beforeAll(async () => {
	const db = await dbConnector();
	fastify = await server(db);
	await fastify.ready();
});

afterAll(() => {
	fastify.close();
});

describe('my beverage', () => {
	it('POST /signup', async () => {
		await supertest(fastify.server)
			.post('/api/v2/signup')
			.send({
				email: 'admin@admin',
				password: 'qwerty',
				name: 'Admin',
				lastname: 'Administrator',
			})
			.expect(201)
			.then((response) => {
				expect(response.body.status).toBe('SUCCESSFUL');
				expect(response.body.message).toBe('The user is created.');
			});
	});
	test('POST /signin', async () => {
		await supertest(fastify.server)
			.post('/api/v2/signin')
			.send({
				email: 'admin@admin',
				password: 'qwerty',
			})
			.expect(200)
			.then((response) => {
				data = response.body;
				expect(response.body._id).toBeDefined();
				expect(response.body.name).toBe('Admin');
				expect(response.body.lastname).toBe('Administrator');
				expect(response.body.accessToken).toBeDefined();
				expect(response.body.accessTokenTime).toBeDefined();
				expect(response.body.SSOToken).toBeDefined();
				expect(response.body.refreshToken).toBeDefined();
			});
	});
	test('POST /refresh', async () => {
		await supertest(fastify.server)
			.post('/api/v2/refresh')
			.send({
				refreshToken: data.refreshToken,
			})
			.expect(200)
			.then((response) => {
				expect(response.body._id).toBeDefined();
				expect(response.body.name).toBe('Admin');
				expect(response.body.lastname).toBe('Administrator');
				expect(response.body.accessToken).toBeDefined();
				expect(response.body.accessTokenTime).toBeDefined();
				expect(response.body.SSOToken).toBeDefined();
				expect(response.body.refreshToken).toBeDefined();
			});
	});
	test('POST /signinSSO', async () => {
		await supertest(fastify.server)
			.post('/api/v2/signinSSO')
			.send({
				SSOToken: data.SSOToken,
			})
			.expect(200)
			.then((response) => {
				expect(response.body._id).toBeDefined();
				expect(response.body.name).toBe('Admin');
				expect(response.body.lastname).toBe('Administrator');
				expect(response.body.accessToken).toBeDefined();
				expect(response.body.accessTokenTime).toBeDefined();
				expect(response.body.SSOToken).toBeDefined();
				expect(response.body.refreshToken).toBeDefined();
			});
	});
	test('POST /verify', async () => {
		await supertest(fastify.server)
			.post('/api/v2/verify')
			.send({
				accessToken: data.accessToken,
			})
			.expect(200)
			.then((response) => {
				expect(response.body.status).toBe('SUCCESSFUL');
				expect(response.body.message).toBe('The token is valid.');
			});
	});
	test('POST /logout', async () => {
		await supertest(fastify.server)
			.post('/api/v2/logout')
			.send({
				accessToken: data.accessToken,
			})
			.expect(200)
			.then((response) => {
				expect(response.body.status).toBe('SUCCESSFUL');
				expect(response.body.message).toBe('User logged out.');
			});
	});
});
