const { Strategy, ExtractJwt } = require("passport-jwt");
require("dotenv").config();
const UserModel = require("../models/User");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

module.exports = (passport) => {
  passport.use(
    new Strategy(opts, (payload, done) => {
      UserModel.findById(payload.id)
        .then((user) => {
          if (user) {
            return done(null, {
              id: user._id,
              fullname: user.fullname,
            });
          }
          return done(null, false);
        })
        .catch((err) => console.error(err));
    })
  );
};
