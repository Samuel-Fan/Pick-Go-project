const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const redisClient = require("./redis").redisClient_user;
const User = require("../models/index").user;

// 以下兩個是給google登入用的

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (_id, done) {
  let foundUser = await User.findOne({ _id }).exec();
  done(null, foundUser);
});

// local 登入
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
ExtractJwt.fromAuthHeaderAsBearerToken;
opts.secretOrKey = process.env.JWT_SECRET;
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      return done(null, { _id: jwt_payload._id });
    } catch (e) {
      return done(e, false);
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
      callbackURL: process.env.SERVER_URI + "/api/users/auth/google/redirect",
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        let googleID = profile.id;

        // 確認資料庫有無此人
        let foundUser = await User.findOne({ googleID }).exec();
        if (foundUser) {
          return cb(null, foundUser);
        }

        let username = profile.displayName || "";
        let email = profile.emails[0] ? profile.emails[0].value || "" : "";

        let newUser = new User({ googleID, username, email });
        let savedUser = await newUser.save();
        return cb(null, savedUser);
      } catch (e) {
        return cb(e, null);
      }
    }
  )
);
