const router = require("express").Router();
const userController = require("../../controllers/userController");
const handleError = require("../../middlewares/handleError");

router.get("/", userController.getUserInfo);
router.patch("/basic", userController.editBasicInfo);
router.patch("/password", userController.editPassword);
router.delete("/", userController.deleteUser);

// 處理系統錯誤
router.use(handleError);

module.exports = router;
