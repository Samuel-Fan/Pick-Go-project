const router = require("express").Router();
const Tour = require("../models").tour;
const passport = require("passport");
const valid = require("../controllers/validation");

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

    let { title, description, status, limit, days } = req.body;
    let tour = new Tour({
      title,
      description,
      status,
      limit,
      days,
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
      let foundTour = await Tour.findOne({ _id });
      if (!foundTour) {
        return res.status(400).send("找不到相關旅程");
      }

      if (!foundTour.author.equals(req.user._id)) {
        return res.status(403).send("必須本人才能編輯");
      }

      let { title, description, status, limit, days } = req.body;
      foundTour.title = title;
      foundTour.description = description;
      foundTour.status = status;
      foundTour.limit = limit;
      foundTour.days = days;
      foundTour.updateDate = Date.now();

      let savedResult = await foundTour.save();
      return res.send(savedResult);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

router.delete(
  "/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      await Tour.findOneAndDelete({
        _id: req.params._id,
        author: req.user._id,
      }).exec();
      return res.send("成功刪除");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

module.exports = router;
