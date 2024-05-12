import config from './configuration';

const corsConfig = () => {
  return {
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config().ORIGINS.indexOf(origin) === -1) {
        return callback(new Error('Cors'), false);
      }
      return callback(null, true);
    },
  };
};

export default corsConfig;
