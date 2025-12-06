import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User, Users } from "../user/user.models";
import message, { MessageType } from "../../utils/message";
import bcrypt from "bcryptjs";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import environments from "../../configurations/environments";

const {
  google_authentication: { client_id, client_secret, callback_url },
} = environments;

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const user = (await Users.findOne({ email }).select(
          "+password"
        )) as User;
        if (!user) {
          return done(null, false, { message: message("notFound", "user") });
        }

        if (["BLOCKED", "INACTIVATED"].includes(user.status)) {
          return done(null, false, {
            message: message(user.status.toLowerCase() as MessageType, email),
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

        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: client_id,
      clientSecret: client_secret,
      callbackURL: callback_url,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile?.emails?.[0].value;

        if (!email) {
          return done(null, false, { message: message("notFound", "email") });
        }
        let user = (await Users.findOne({ email })) as User;

        if (["BLOCKED", "INACTIVE"].includes(user.status)) {
          return done(null, false, {
            message: message(user.status?.toLowerCase() as MessageType, email),
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
        if (!user) {
          user = await Users.create({
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0].value,
            role: "RIDER",
            isVerified: true,
            auths: [{ provider: "GOOGLE", providerId: profile.id }],
          });
        }
        return done(null, user);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Google strategy error, ", error);
        return done(error);
      }
    }
  )
);
