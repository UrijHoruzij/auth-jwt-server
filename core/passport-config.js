const { Strategy, ExtractJwt } = require("passport-jwt");
const UserModel = require("../models/User");
require("dotenv").config();

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

module.exports = (passport) => {
  passport.use(
    new Strategy(opts, async (payload, done) => {
      const user = UserModel.findById(payload.id);
      if (user) {
        return done(null, {
          id: user._id,
          name: user.name,
          lastname: user.lastname
        });
      } else {
        return done(null, false);
      }
    })
  );
};
