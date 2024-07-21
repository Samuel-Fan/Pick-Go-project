const router = require("express").Router();
const passport = require("passport");
const userController = require("../controllers/user");

// 1. 不須登入的功能
router.get("/profile/:_id", userController.getUserinfoById);

// google登入、註冊會員
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
router.get(
  "/auth/google/redirect",
  passport.authenticate("google"),
  userController.googleRedirect
);
router.get("/auth/google/setJwt", userController.googleSetJWT);
router.post("/login", userController.login);
router.post("/register", userController.register);

// 2. 需登入的功能(用JWT驗證)
router.use(passport.authenticate("jwt", { session: false }));

router.get("/", userController.getUserInfo);
router.patch("/basic", userController.editBasicInfo);
router.patch("/password", userController.editPassword);
router.delete("/", userController.deleteUser);

module.exports = router;
