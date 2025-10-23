import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User, Users } from "../user/user.models";
import message, { MessageType } from "../../utils/message";
import bcrypt from "bcryptjs";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      console.log("here");
      try {
        const user = (await Users.findOne({ email }).select(
          "+passport"
        )) as User;
        if (!user) {
          return done(null, false, { message: message("notFound", "user") });
        }

        if (["BLOCKED", "INACTIVE"].includes(user.activityStatus)) {
          return done(null, false, {
            message: message(
              user.activityStatus.toLowerCase() as MessageType,
              email
            ),
          });
        }
        if (user.isDeleted) {
          return done(null, false, {
            message:
              "This account has been deleted. Please create a new account or try again later.",
          });
        }
        if (!user.isVerified) {
          return done(null, false, {
            message:
              "This account has not been verified. Please verify your account or request a new verification link.",
          });
        }
        const authProvider = user.auths.some(
          (auth) => auth.provider !== "CREDENTIAL"
        );
        if (authProvider && !user.password) {
          return done(null, false, {
            message:
              "Your account is currently signed in using a social login. If you want to sign in using your email and password, you first need to set a password for your account. Once the password is created, you can use your email and password to log in directly without using the social option.",
          });
        }
        const matchPassword = await bcrypt.compare(
          password as string,
          user.password as string
        );
        if (!matchPassword) {
          return done(message("badRequest", "sign in"));
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: unusedProperty, ...rest } = user;
        return done(null, rest);
      } catch (error) {
        done(error);
      }
    }
  )
);
