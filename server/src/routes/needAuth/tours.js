const router = require("express").Router();
const tourController = require("../../controllers/tourController");
const handleError = require("../../middlewares/handleError");

router.get("/myTour", tourController.getMyTourList);
router.get("/myTour/count", tourController.countMyTourData);
router.get("/myTour/detail/:_id", tourController.getPrivateTourDetail);

// 得到登入使用者參加的旅程
router.get("/myApplied", tourController.getMyAppliedTour);

// 確認自己於某旅程的參加狀態
router.get("/myType", tourController.checkMyAppliedStatus);

// 得到某景點的參加人員詳細資訊
router.get("/:tour_id/tourist", tourController.getAppliedList);

router.post("/new", tourController.create);
router.post("/:_id/addSites", tourController.addSites);
router.post("/apply/:tour_id", tourController.apply);
router.post("/copy/:tour_id", tourController.copy);
router.patch("/:_id", tourController.edit);
router.patch("/add_participant/:_id", tourController.addTourist);
router.delete("/:_id", tourController.deleteTour);
router.delete("/tourSite/:_id", tourController.deleteSite);

// 刪某旅程限制天數外的行程 (如 5 -> 3天， 刪掉 4、5天的景點)
router.delete(
  "/over_totalDays/:_id/:day",
  tourController.deleteSiteOverLimitDay
);

// 剔除申請者 or 參加者
router.delete("/tourist/:_id", tourController.deleteTourist);

// 處理系統錯誤
router.use(handleError);

module.exports = router;
