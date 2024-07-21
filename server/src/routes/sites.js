const router = require("express").Router();
const siteController = require("../controllers/site");

// 1. 公開頁面
// 以關鍵字搜尋景點
router.get("/search", siteController.searchSite);
router.get("/count", siteController.CountNumberOfPublicData);
router.get("/detail/:_id", siteController.getPublicSiteById);

// 找尋特定作者的其他site，排除query給予的site_id
router.get("/other", siteController.getOtherSitesByAuthor);

// 2. 私人頁面
router.use(passport.authenticate("jwt", { session: false }));
router.get("/mySite/detail/:_id", siteController.getMySiteDetail);
router.get("/mySite", siteController.getMySiteList);
router.get("/mySite/count", siteController.countNumberOfMySite);
router.get("/myCollections", siteController.getMyCollections);
router.get("/myCollection/count", siteController.countNumberOfMyCollections);
router.get("/like_collection/:_id", siteController.checkLikeOrCollection);
router.post("/new", siteController.createNewSite);
router.put("/like/:_id", siteController.likeSite);
router.put("/collection/:_id", siteController.collectSite);
router.patch("/:_id", siteController.editSite);
router.delete("/:_id", siteController.deleteSite);
router.delete("/like/:_id", siteController.removeLike);
router.delete("/collection/:_id", siteController.removeCollection);

module.exports = router;
