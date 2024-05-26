const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const reditClient = require("./redis");
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
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
ExtractJwt.fromAuthHeaderAsBearerToken;
opts.secretOrKey = process.env.JWT_SECRET;
passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      let foundUser;
      // 先找尋快取中有沒有
      foundUser = await reditClient.get(`User:${jwt_payload._id}`);
      if (foundUser) {
        console.log("使用快取找到使用者");
        return done(null, JSON.parse(foundUser));
      }

      // 若沒有找到快取，則從資料庫搜尋，並存入快取
      foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
      console.log("使用資料庫找到使用者");
      if (foundUser) {
        await reditClient.set(
          `User:${jwt_payload._id}`,
          JSON.stringify(foundUser)
        );
        return done(null, foundUser);
      } else {
        return done(null, false);
      }
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
