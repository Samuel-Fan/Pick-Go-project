const router = require("express").Router();
const passport = require("passport");
const tourController = require("../controllers/tour");

// 1. 公開頁面

// 以關鍵字搜尋旅程
router.get("/search", tourController.searchTour);
router.get("/count", tourController.countNumberOfPublicTour);
router.get("/detail/:_id", tourController.getPublicTourDetail);

// 2. 需登入頁面
router.use(passport.authenticate("jwt", { session: false }));

// 得到登入使用者建立的旅程
router.get("/myTour", tourController.getMyTourList);
router.get("/myTour/count", tourController.countNumberOfMyTour);

// 得到單一旅程詳細資訊(私人 -- 主辦者、參加者可看)
router.get("/myTour/detail/:_id", tourController.getPrivateTourDetail);

// 得到登入使用者參加的旅程
router.get("/myApplied", tourController.getMyAppliedTour);

// 確認自己於某旅程的參加狀態
router.get("/myType", tourController.checkMyAppliedStatus);

// 得到某景點的參加人員詳細資訊
router.get("/:tour_id/tourist", tourController.getAppliedList);

// 建立旅程
router.post("/new", tourController.createNewTour);

// 旅程匯入景點資訊
router.post("/:_id/addSites", tourController.addSiteToTour);

// 成為某個旅程的申請人
router.post("/apply/:tour_id", tourController.applyTour);

// 複製旅程
router.post("/copy/:tour_id", tourController.copyTour);

// 修改旅程
router.patch("/:_id", tourController.editTour);

// 將申請者設定參加者
router.patch("/add_participant/:_id", tourController.addSomeoneToTourist);

// 刪旅程
router.delete("/:_id", tourController.deleteTour);

// 刪旅程中的特定景點
router.delete("/tourSite/:_id", tourController.deleteSiteOfTour);

// 刪某旅程限制天數外的行程 (如 5 -> 3天， 刪掉 4、5天的景點)
router.delete(
  "/over_totalDays/:_id/:day",
  tourController.deleteSiteOverLimitDay
);

// 剔除申請者 or 參加者
router.delete("/tourist/:_id", tourController.deleteTourist);

module.exports = router;
