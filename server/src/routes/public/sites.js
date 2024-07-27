const router = require("express").Router();
const siteController = require("../../controllers/siteController");
const handleError = require("../../middlewares/handleError");

// 1. 公開頁面
// 以關鍵字搜尋景點
router.get("/search", siteController.searchSite);
router.get("/count", siteController.countPublicData);
router.get("/detail/:_id", siteController.getPublicSiteById);

// 找尋特定作者的其他site，排除query給予的site_id
router.get("/other", siteController.getOtherSitesOfAuthor);

// 處理系統錯誤
router.use(handleError);

module.exports = router;
