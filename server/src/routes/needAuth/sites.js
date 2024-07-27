const router = require("express").Router();
const siteController = require("../../controllers/siteController");
const handleError = require("../../middlewares/handleError");

// 私人頁面
router.get("/mySite/detail/:_id", siteController.getMySiteDetail);
router.get("/mySite", siteController.getMySiteList);
router.get("/mySite/count", siteController.countMySiteData);
router.get("/myCollections", siteController.getMyCollections);
router.get("/myCollection/count", siteController.countMyCollections);

router.post("/new", siteController.createNewSite);
router.patch("/:_id", siteController.editSite);
router.delete("/:_id", siteController.deleteSite);

// 按讚、收藏
router.get("/like_collection/:_id", siteController.checkLikeOrCollection);
router.put("/like/:_id", siteController.likeSite);
router.put("/collection/:_id", siteController.collectSite);
router.delete("/like/:_id", siteController.removeLike);
router.delete("/collection/:_id", siteController.removeCollection);

// 處理系統錯誤
router.use(handleError);

module.exports = router;
