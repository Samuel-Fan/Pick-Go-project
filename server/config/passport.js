const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const User = require("../models/index").user;

passport.serializeUser(function (user, done) {
  console.log("Serialize使用者");
  done(null, user._id);
});

passport.deserializeUser(async function (_id, done) {
  let foundUser = await User.findOne({ _id }).exec();
  console.log(
    "Deserialize使用者，使用serializeUser儲存的id，去找到資料庫內的資料"
  );
  done(null, foundUser);
});

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
