const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/index").user;

passport.serializeUser(function (user, done) {
  console.log("serializeUser");
  done(null, user._id);
});

passport.deserializeUser(async function (_id, done) {
  console.log("deserializeUser");
  let foundUser = await User.findOne({ _id }).exec();
  done(null, foundUser);
});

// local 登入
passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      let foundUser = await User.findOne({ email: username }).exec();
      if (!foundUser) {
        return done(null, false);
      }

      let result = await bcrypt.compare(password, foundUser.password);
      if (!result) {
        return done(null, false);
      }
      return done(null, foundUser);
    } catch (e) {
      console.log(e);
      return done(e);
    }
  })
);

// google授權登入
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // callbackURL: "http://localhost:8080/api/users/auth/google/redirect",
      callbackURL:
        "https://8080-samuelfan-pickgoproject-063jy55okjc.ws-us110.gitpod.io/api/users/auth/google/redirect",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let googleID = profile.id;
        // 確認資料庫有無此人
        let foundUser = await User.findOne({ googleID }).exec();
        console.log(foundUser);
        if (foundUser) {
          return cb(null, foundUser);
        }

        let username = profile.displayName;
        let email = profile.emails[0].value;
        let newUser = new User({ googleID, username, email });
        let savedUser = await newUser.save();
        return cb(null, savedUser);
      } catch (e) {
        return cb(e, null);
      }
    }
  )
);
