// Importing Passport, strategies, and config
const passport = require("passport"),
  User = require("../models/user"),
  { secret } = require("./config"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  LocalStrategy = require("passport-local"),
  awaitParser = require("../controllers/utils/asyncAwait");

const localOptions = { usernameField: "email" };

// Setting up local login strategy
const localLogin = new LocalStrategy(
  localOptions,
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, {
          error: "Your login details could not be verified. Please try again."
        });
      }

      user.comparePassword(password, function(err, isMatch) {
        if (err) {
          console.log(err);
          return done(err);
        }
        if (!isMatch) {
          return done(null, false, {
            error: "Your login details could not be verified. Please try again."
          });
        }

        return done(null, user);
      });
    } catch (error) {
      done(error);
    }
  }
);

const jwtOptions = {
  // Telling Passport to check authorization headers for JWT
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
  // Telling Passport where to find the secret
  secretOrKey: secret
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  const [err, user] = await awaitParser(
    User.findById(payload._id).populate("role")
  );
  if (err) {
    return done(err, false);
  }
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

passport.use(jwtLogin);
passport.use(localLogin);
