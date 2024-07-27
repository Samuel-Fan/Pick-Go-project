const router = require("express").Router();
const adminController = require("../../controllers/adminController");
const handleError = require("../../middlewares/handleError");

// 使用者列表
router.get("/users", adminController.getUser);

// 使用者資料數(用來計算頁數)
router.get("/users/count", adminController.getTotalUserNumber);

// 特定使用者
router.get("/user/:_id", adminController.getUserById);

// 景點列表
router.get("/sites", adminController.getSites);

// 景點資料數(用來計算頁數)
router.get("/sites/count", adminController.getTotalSitesNumber);

// 特定景點
router.get("/site/:_id", adminController.getSiteById);

// 旅程列表
router.get("/tours", adminController.getTours);

// 旅程資料數(用來計算頁數)
router.get("/tours/count", adminController.getTotalToursNumber);

// 特定旅程
router.get("/tour/:_id", adminController.getTourById);

// 刪除一個使用者以及他的所有相關物
router.delete("/user/:_id", adminController.deleteUser);

// 刪除一個景點以及他的所有相關物
router.delete("/site/:_id", adminController.deleteSite);

// 刪除一個旅程以及他的所有相關物
router.delete("/tour/:_id", adminController.deleteTour);

// 處理系統錯誤
router.use(handleError);

module.exports = router;
