const router = require("express").Router();
const googleOauth = require("../../middlewares/googleOauth");
const userController = require("../../controllers/userController");
const handleError = require("../../middlewares/handleError");

// 1. 不須登入的功能
router.get("/profile/:_id", userController.getUserinfoById);

// google登入、註冊會員
router.get("/auth/google", googleOauth);
router.get("/auth/google/redirect", googleOauth, userController.googleRedirect);
router.get("/auth/google/setJwt", userController.googleSetJWT);
router.post("/login", userController.login);
router.post("/register", userController.register);

// 處理系統錯誤
router.use(handleError);

module.exports = router;
