export default () => ({
  CLUSTERS: true,
  ORIGINS: [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:3006',
    'http://localhost:7000',
  ],
  PORT: 5000,
  DATABASE_URL: 'mongodb://localhost:27017/auth?authSource=admin',
  SHOW_GRAPHIQL: true,
  ACCESS_TOKEN_TIME: '900s',
  REFRESH_TOKEN_TIME: '7d',
  SSO_TOKEN_TIME: '300s',
  SECRET: 'secret',
  SECRET_REFRESH: 'secretRefresh',
  SSO_TOKEN_SECRET: 'secretSSO',
  COOKIE_CONFIG: { httpOnly: true },
});
