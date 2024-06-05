const router = require("express").Router();
const Tour = require("../models").tour;
const TourSite = require("../models").tourSite;
const Tourist = require("../models").tourist;
const passport = require("passport");
const valid = require("../controllers/validation");
const { tourSite } = require("../models");
const ObjectId = require("mongoose").Types.ObjectId;
const redisClient = require("../config/redis");

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

// 得到登入使用者的旅程
router.get(
  "/myTour",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    let { page, numberPerPage } = req.query;
    try {
      let foundTour = await Tour.aggregate([
        { $match: { author: new ObjectId(_id) } },
        {
          $lookup: {
            from: "tourists",
            localField: "_id",
            foreignField: "tour_id",
            as: "participants",
            pipeline: [
              { $match: { $or: [{ type: "主辦者" }, { type: "參加者" }] } },
            ],
          },
        },
        {
          $project: {
            num_of_participants: { $size: "$participants" },
            title: 1,
            description: 1,
            status: 1,
            totalDays: 1,
            limit: 1,
            updateDate: 1,
          },
        },
        { $skip: (page - 1) * numberPerPage },
        { $limit: Number(numberPerPage) },
        {
          $sort: {
            updateDate: -1,
          },
        },
      ]);

      return res.send(foundTour);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 得到特定旅程(私人)
router.get(
  "/myTour/detail/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params;
    try {
      // 先搜尋快取中有無數據
      let dataFromRedis = await redisClient.get(`Tour:${_id}`);
      if (dataFromRedis === "404") {
        console.log("利用快取返回404 error");
        return res.status(404).send("錯誤");
      }

      if (dataFromRedis) {
        dataFromRedis;
        console.log("利用快取提供景點資料");
        return res.send(dataFromRedis);
      }

      // // 若找不到則搜尋資料庫
      console.log("利用資料庫提取旅程資料");

      let query1 = Tour.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
            author: new ObjectId(req.user._id),
          },
        },
        {
          $lookup: {
            from: "tourists",
            localField: "_id",
            foreignField: "tour_id",
            as: "participants",
            pipeline: [
              { $match: { $or: [{ type: "主辦者" }, { type: "參加者" }] } },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            num_of_participants: { $size: "$participants" },
            title: 1,
            description: 1,
            totalDays: 1,
            limit: 1,
            status: 1,
            updateDate: 1,
            "author._id": 1,
            "author.username": 1,
          },
        },
      ]);

      let query2 = tourSite.aggregate([
        {
          $match: {
            tour_id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "sites",
            localField: "site_id",
            foreignField: "_id",
            as: "site_info",
          },
        },
        { $unwind: { path: "$site_info", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            day: 1,
            site_id: 1,
            title: "$site_info.title",
            country: "$site_info.country",
            region: "$site_info.region",
            type: "$site_info.type",
          },
        },
        { $sort: { day: 1 } },
      ]);

      let [foundTour, dayPlan] = await Promise.all([query1, query2]);

      foundTour = foundTour[0];

      // 若沒找到資料
      if (!foundTour) {
        // 找不到資料也存進快取，防快取穿透 Cache Penetration
        await redisClient.set(`Tour:${_id}`, "404", {
          EX: 60 * 60 * 1,
        });
        return res.status(404).send("無此資料");
      }

      let randomTime = Math.floor(Math.random() * 31) + 30; // 使用隨機數，防快取雪崩 Cache Avalanche
      if (foundTour.status !== "不公開") {
        await redisClient.set(
          `Tour:${_id}`,
          JSON.stringify({ foundTour, dayPlan }),
          {
            EX: randomTime * 60 * 1,
          }
        );
      }

      return res.send({ foundTour, dayPlan });
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 得到特定旅程(公開)
router.get(
  "/detail/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params;
    try {
      // 先搜尋快取中有無數據
      let dataFromRedis = await redisClient.get(`Tour:${_id}`);
      if (dataFromRedis === "404") {
        console.log("利用快取返回404 error");
        return res.status(404).send("錯誤");
      }

      if (dataFromRedis) {
        dataFromRedis;
        console.log("利用快取提供景點資料");
        return res.send(dataFromRedis);
      }

      // // 若找不到則搜尋資料庫
      console.log("利用資料庫提取旅程資料");

      let query1 = Tour.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "tourists",
            localField: "_id",
            foreignField: "tour_id",
            as: "participants",
            pipeline: [
              { $match: { $or: [{ type: "主辦者" }, { type: "參加者" }] } },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            num_of_participants: { $size: "$participants" },
            title: 1,
            description: 1,
            totalDays: 1,
            limit: 1,
            status: 1,
            updateDate: 1,
            "author._id": 1,
            "author.username": 1,
          },
        },
      ]);

      let query2 = tourSite.aggregate([
        {
          $match: {
            tour_id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "sites",
            localField: "site_id",
            foreignField: "_id",
            as: "site_info",
          },
        },
        { $unwind: { path: "$site_info", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            day: 1,
            site_id: 1,
            title: "$site_info.title",
            country: "$site_info.country",
            region: "$site_info.region",
            type: "$site_info.type",
          },
        },
        { $sort: { day: 1 } },
      ]);

      let [foundTour, dayPlan] = await Promise.all([query1, query2]);

      foundTour = foundTour[0];

      // 若沒找到資料
      if (!foundTour) {
        // 找不到資料也存進快取，防快取穿透 Cache Penetration
        await redisClient.set(`Tour:${_id}`, "404", {
          EX: 60 * 60 * 1,
        });
        return res.status(404).send("無此資料");
      }

      // 若旅程公開，則存入快取
      let randomTime = Math.floor(Math.random() * 31) + 30; // 使用隨機數，防快取雪崩 Cache Avalanche
      if (foundTour.status !== "不公開") {
        await redisClient.set(
          `Tour:${_id}`,
          JSON.stringify({ foundTour, dayPlan }),
          {
            EX: randomTime * 60 * 1,
          }
        );
      } else {
        // 若不公開，快取存入error 403
        await redisClient.set(`Tour:${_id}`, "403", {
          // 防快取穿透 Cache Penetration，其實期限可以設久一點
          EX: 60 * 60 * 1,
        });
        return res.status(403).send("作者不公開相關頁面");
      }

      return res.send({ foundTour, dayPlan });
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 計算使用者的tours總數
router.get(
  "/myTour/count",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    try {
      let count = await Tour.find({ author: new ObjectId(_id) })
        .count()
        .exec();
      return res.send({ count });
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 得到某景點的參加人員詳細資訊
router.get(
  "/:tour_id/tourist",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { tour_id } = req.params;
    try {
      // 找尋相關旅程及相關參與人員
      let [foundTour, tourists] = await Promise.all([
        Tour.findOne({ _id: tour_id }).select("author").lean().exec(),
        Tourist.find({ tour_id })
          .populate("user_id", ["username"])
          .lean()
          .exec(),
      ]);

      // 若找不到相關旅程
      if (!foundTour) {
        return res.status(400).send("找不到相關旅程");
      }

      // 若非作者本人操作
      if (!foundTour.author.equals(req.user._id)) {
        return res.status(403).send("只有作者才能操作");
      }

      return res.send(tourists);
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

    let tour_id = tour._id;
    let tourist = new Tourist({
      user_id: req.user._id,
      tour_id,
      type: "主辦者",
    });

    try {
      await Promise.all([tour.save(), tourist.save()]);
      return res.send("資料儲存完畢");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 旅程匯入景點資訊
router.post(
  "/:_id/addSites",
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
    console.log(req.body);
    let site_arr = req.body;
    try {
      if (site_arr.length === 0) {
        return res.send("無任何資料新增");
      }

      site_arr.map((site) => (site.tour_id = _id));

      await Promise.all([
        TourSite.insertMany(site_arr),
        redisClient.del(`Tour:${_id}`), // 刪快取
      ]);

      return res.send("已新增景點");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 成為某個旅程的申請人
router.post(
  "/:tour_id/apply",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let { tour_id } = req.params;

      // 找尋相關旅程
      let foundTour = await Tour.findOne({ _id: tour_id })
        .select(["status", "limit"])
        .lean()
        .exec();

      // 若找不到相關旅程
      if (!foundTour) {
        return res.status(400).send("找不到相關旅程");
      }

      // 若旅程並非找尋旅伴中
      if (foundTour.status !== "找旅伴") {
        return res.status(403).send("目前無開放申請");
      }

      // 確認是否已申請過
      let check = await Tourist.findOne({ tour_id, user_id: req.user._id })
        .select("user_id")
        .lean()
        .exec();

      if (check) {
        return res.status(400).send("您已申請過 or 已參加");
      }

      // 確認人數是否已達上限
      let count = await Tourist.find({
        tour_id: new ObjectId(tour_id),
        type: { $ne: "申請者" },
      })
        .count()
        .exec();
      console.log("count", count);
      if (count >= foundTour.limit) {
        return res.status(403).send("人數已達上限");
      }

      // 若以上都沒問題，則設定為申請者
      let tourist = new Tourist({
        tour_id,
        user_id: req.user._id,
        type: "申請者",
      });

      await tourist.save();
      return res.send("您已成功發出申請");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 修改旅程
router.patch(
  "/modify/:_id",
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

      await Promise.all([
        Tour.findOneAndUpdate({ _id }, newData, {
          // 更新資料
          runValidators: true,
        }),
        redisClient.del(`Tour:${_id}`), // 刪快取
      ]);

      return res.send("已修改");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 將申請者設定參加者
router.patch(
  "/add_participant/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let { _id } = req.params;

      // 確認有無該申請者
      let applicant = await Tourist.findOne({ _id })
        .populate("tour_id", ["author", "limit"])
        .exec();

      console.log(applicant);
      // 若找不到相關旅程
      if (!applicant.tour_id) {
        return res.status(400).send("找不到相關旅程");
      }

      // 若非作者本人操作
      if (!applicant.tour_id.author.equals(req.user._id)) {
        return res.status(403).send("只有作者才能操作");
      }

      // 確認有無該申請者
      if (!applicant) {
        return res.status(400).send("無找到相關申請者");
      }

      // 確認是否已參加
      if (applicant.type !== "申請者") {
        return res.status(400).send("此人已參加旅行團");
      }

      // 確認人數是否已達上限
      let count = await Tourist.find({
        tour_id: applicant.tour_id._id,
        type: { $ne: "申請者" },
      })
        .count()
        .lean()
        .exec();

      if (count >= applicant.tour_id.limit) {
        return res.status(403).send("人數已達上限");
      }

      // 若以上都沒問題，則設定為參加者

      applicant.type = "參加者";
      await Promise.all([
        applicant.save(),
        redisClient.del(`Tour:${applicant.tour_id._id}`),
      ]); // 刪快取
      return res.send("已成功加入該成員");
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
      let { _id } = req.params;
      let foundTour = await Tour.findOne({ _id }).lean().exec();
      // 若無相關旅程
      if (!foundTour) {
        return res.status(400).send("無搜尋到相關旅程");
      }

      // 若非本人刪除
      if (!foundTour.author.equals(req.user._id)) {
        return res.status(403).send("本人才能刪除");
      }

      await Promise.all([
        Tour.findOneAndDelete({ _id }),
        TourSite.deleteMany({ tour_id: _id }),
        Tourist.deleteMany({ tour_id: _id }),
        redisClient.del(`Tour:${_id}`),
      ]);

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
      await Promise.all([
        TourSite.deleteOne({ _id }),
        redisClient.del(`Tour:${foundSite.tour_id._id}`), // 刪快取
      ]);

      return res.send("成功刪除");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 刪某旅程限制天數外的行程
router.delete(
  "/over_totalDays/:_id/:day",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let tour_id = req.params._id; // 某個旅程
    let day = Number(req.params.day); // 總天數
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
      await TourSite.deleteMany({ tour_id, day: { $gt: day } });
      return res.send("成功刪除");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 剔除申請者 or 參加者
router.delete(
  "/tourist/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let { _id } = req.params;

      let info = await Tourist.findOne({ _id })
        .populate("tour_id", ["author"])
        .lean()
        .exec();
      console.log(info);

      // 確認有無該申請者/參加者
      if (!info) {
        return res.status(400).send("無找到相關參加者");
      }

      // 若該旅程不存在
      if (!info.tour_id) {
        return res.status(400).send("該旅程不存在");
      }

      // 若非作者本人操作
      if (!info.tour_id.author.equals(req.user._id)) {
        return res.status(403).send("只有作者才能操作");
      }

      // 確認該人非主辦者本人
      if (info.user_id.equals(req.user._id)) {
        return res.status(400).send("不可以刪掉主辦人");
      }

      // 若以上都沒問題，則刪去該人員
      await Promise.all([
        Tourist.deleteOne({ _id }).exec(),
        redisClient.del(`Tour:${info.tour_id._id}`), //刪快取
      ]);
      return res.send("您已成功刪除");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

module.exports = router;
