import passport from "passport";

import { Strategy as LocalStrategy } from "passport-local";
import { User, Users } from "../modules/user/user.models";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const user = (await Users.findOne({ email }).select(
          "+passport"
        )) as User;
        if (!user) {
          return done(null);
        }
      } catch (error) {
        done(error);
      }
    }
  )
);
