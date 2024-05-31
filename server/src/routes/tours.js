const router = require("express").Router();
const Tour = require("../models").tour;
const TourSite = require("../models").tourSite;
const passport = require("passport");
const valid = require("../controllers/validation");
const ObjectId = require("mongoose").Types.ObjectId;

// 測試tourist資料
router.get("/test", async (req, res) => {
  try {
    let foundTour = await TourSite.find()
      .populate("tour_id", ["title", "author"])
      .populate("site_id", ["title"])
      .exec();

    return res.send(foundTour);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 得到登入使用者的全部旅程
router.get(
  "/myTour",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    let { page, numberPerPage } = req.query;
    try {
      let foundTour = await Tour.find({ author: _id })
        .populate("author", ["username"])
        .skip((page - 1) * numberPerPage)
        .limit(numberPerPage)
        .lean()
        .exec();

      return res.send(foundTour);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 建立旅程
router.post(
  "/new",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // 如旅程規格不符，則返回客製化錯誤訊息
    let { error } = valid.toursValidation(req.body); // req.body 含 title, description, status, limit, days
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    let { title, description, status, limit, totalDays } = req.body;
    let tour = new Tour({
      title,
      description,
      status,
      limit,
      totalDays,
      author: req.user._id,
    });

    try {
      let savedResult = await tour.save();
      return res.send(savedResult);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 旅程匯入景點資訊
router.post(
  "/addSites/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params;
    // 確認本人編輯
    let foundTour = await Tour.findOne({ _id }).select("author").lean().exec();
    console.log(foundTour);
    if (!foundTour) {
      return res.status(400).send("找不到相關旅程");
    }

    if (!foundTour.author.equals(req.user._id)) {
      return res.status(403).send("本人才能編輯");
    }

    let site_arr = JSON.parse(req.body.site_arr);
    if (site_arr.length === 0) {
      return res.send("無任何資料新增");
    }

    site_arr.map((site) => (site.tour_id = _id));

    try {
      let result = await TourSite.insertMany(site_arr);
      return res.send(result);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 修改旅程
router.patch(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params;

    // 如旅程規格不符，則返回客製化錯誤訊息
    let { error } = valid.toursValidation(req.body); // req.body 含 title, description, status, limit, days
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    try {
      let foundTour = await Tour.findOne({ _id }).lean().exec();
      if (!foundTour) {
        return res.status(400).send("找不到相關旅程");
      }

      if (!foundTour.author.equals(req.user._id)) {
        return res.status(403).send("必須本人才能編輯");
      }

      let newData = Object.assign({}, req.body, { updateDate: Date.now() });

      let result = await Tour.findOneAndUpdate({ _id }, newData, {
        // 更新資料
        new: true,
        runValidators: true,
      });

      return res.send(result);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 刪旅程
router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      await Tour.findOneAndDelete({
        _id: req.params._id,
        author: req.user._id,
      }).exec();
      await TourSite.deleteMany({ tour_id: req.params._id }).exec();
      return res.send("成功刪除");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 刪旅程中的特定景點
router.delete(
  "/tourSite/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params; // tourSite_id
    try {
      let foundSite = await TourSite.findOne({ _id })
        .populate("tour_id", ["author"])
        .select("tour_id")
        .lean()
        .exec();

      // 若找不到景點，返回錯誤
      if (!foundSite) {
        return res.status(400).send("找不到相關景點");
      }

      // 非本人編輯，返回錯誤
      if (!foundSite.tour_id.author.equals(req.user._id)) {
        return res.status(403).send("只有本人才能刪除");
      }

      // 刪除行程
      await TourSite.deleteOne({ _id });

      return res.send("成功刪除");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 刪某旅程限制天數外的行程
router.delete(
  "/over_totalDays/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let tour_id = req.params._id; // 某個旅程
    let day = Number(req.query.day); // 總天數
    try {
      let foundSite = await Tour.findOne({ _id: tour_id })
        .select("author")
        .lean()
        .exec();

      // 若找不到景點，返回錯誤
      if (!foundSite) {
        return res.status(400).send("找不到相關行程");
      }

      // 天數沒給
      if (!day) {
        return res.status(400).send("必須給'天數'的參數才能刪除");
      }

      // 非本人編輯，返回錯誤
      if (!foundSite.author.equals(req.user._id)) {
        return res.status(403).send("只有本人才能編輯");
      }

      // 刪除行程
      let result = await TourSite.deleteMany({ tour_id, day: { $gt: day } });
      console.log(result);
      return res.send("成功刪除");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

module.exports = router;
