import passport from "passport";
import GoogleStrategy from "passport-google-oauth";
import { devConfig } from "../../config/env/development";
import User from "../resources/user/user.model";

export const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy.OAuth2Strategy(
      {
        clientID: devConfig.google.clientId,
        clientSecret: devConfig.google.clientSecret,
        callbackURL: devConfig.google.callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("accessToken :>> ", accessToken);
          console.log("refreshToken :>> ", refreshToken);
          console.log("profile :>> ", profile);

          const user = await User.findOne({'google.id': profile.id});
          if(user){
            return done(null, user);
          }

          const newUser = new User({});
          newUser.google.id = profile.id;
          newUser.google.token = accessToken;
          newUser.google.displayName = profile.displayName;
          newUser.google.email = profile.emails[0].value;
          await newUser.save();
          done(null, newUser);
          
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );
};
