const passport = require("passport");

module.exports = passport.authenticate("google", {
  scope: ["profile", "email"],
  prompt: "select_account",
});
