import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';

let data: any = {};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('POST /signup', async () => {
    return request(app.getHttpServer())
      .post('/api/v3/auth/signup')
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
    return request(app.getHttpServer())
      .post('/api/v3/auth/signin')
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
    return request(app.getHttpServer())
      .post('/api/v3/auth/refresh')
      .send({
        refreshToken: data?.refreshToken,
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
    return request(app.getHttpServer())
      .post('/api/v3/auth/signinSSO')
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
    return request(app.getHttpServer())
      .post('/api/v3/auth/verify')
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
    return request(app.getHttpServer())
      .post('/api/v3/auth/logout')
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
