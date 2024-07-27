const router = require("express").Router();
const tourController = require("../../controllers/tourController");
const handleError = require("../../middlewares/handleError");

router.get("/search", tourController.search);
router.get("/count", tourController.countPublicData);
router.get("/detail/:_id", tourController.getPublicTourDetail);

// 處理系統錯誤
router.use(handleError);

module.exports = router;
