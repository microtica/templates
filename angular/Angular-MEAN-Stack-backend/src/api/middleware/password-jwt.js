import PassportJWT from "passport-jwt";
import { devConfig } from "../../config/env/development";
import User from "../resources/user/user.model";
import passport from "passport";

export const configureStrategy = () => {
  var opts = {};
  opts.jwtFromRequest = PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = devConfig.secret;
  passport.use(
    new PassportJWT.Strategy(opts, (payload, done) => {
      User.findOne({ _id: payload.id }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        }
        return done(null, false);
        // or you could create a new account
      });
    })
  );
};
