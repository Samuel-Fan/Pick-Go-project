const router = require("express").Router();
const Admin = require("../models/index").admin;
const User = require("../models/index").user;
const Site = require("../models/index").site;
const Collection = require("../models/index").collection;
const Like = require("../models/index").like;
const Tour = require("../models").tour;
const TourSite = require("../models").tourSite;
const Tourist = require("../models").tourist;
const imgurClient = require("../config/imgur");
const ObjectId = require("mongoose").Types.ObjectId;

// 管理員身分驗證;
router.use(async (req, res, next) => {
  let checkAuth = await Admin.findOne({ admin_id: new ObjectId(req.user._id) });
  if (checkAuth) {
    console.log("確認有後台權限");
    next();
  } else {
    return res.status(403).send("無權限");
  }
});

// 使用者列表
router.get("/users", async (req, res) => {
  try {
    let { username, email, page, numberPerPage } = req.query;
    let searchObj = Object.assign(
      {},
      username && { username: { $regex: username, $options: "i" } },
      email && { email }
    );

    let foundUser = await User.find(searchObj)
      .select(["username", "email", "description"])
      .skip((page - 1) * numberPerPage)
      .limit(numberPerPage)
      .lean()
      .exec();

    return res.send(foundUser);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 使用者資料數(用來計算頁數)
router.get("/users/count", async (req, res) => {
  try {
    let { username, email } = req.query;
    let searchObj = Object.assign(
      {},
      username && { username: { $regex: username, $options: "i" } },
      email && { email }
    );

    let count = await User.find(searchObj).count();

    return res.send({ count });
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 特定使用者
router.get("/user/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let foundUser = await User.findOne({ _id })
      .select({ password: 0 })
      .lean()
      .exec();

    // 若搜尋不到使用者
    if (!foundUser) {
      return res.status(400).send("找不到使用者");
    }

    return res.send(foundUser);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 景點列表
router.get("/sites", async (req, res) => {
  try {
    let {
      title,
      country,
      region,
      type,
      username,
      page,
      numberPerPage,
      orderBy,
    } = req.query;

    // 若快取沒有，則搜尋資料庫
    let searchObj = Object.assign(
      {},
      country && { country },
      region && { region },
      type && { type },
      username && { "author.username": { $regex: username, $options: "i" } },
      title && { title: { $regex: title, $options: "i" } }
    );

    let sortObj;
    if (orderBy === "date") {
      sortObj = { updateDate: -1 };
    } else if (orderBy === "like") {
      sortObj = { num_of_like: -1, updateDate: -1 };
    }

    foundSite = await Site.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1 } }],
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      { $match: searchObj },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "site_id",
          as: "like",
        },
      },
      {
        $project: {
          title: 1,
          country: 1,
          region: 1,
          content: 1,
          public: 1,
          photo: 1,
          updateDate: 1,
          "author._id": 1,
          "author.username": 1,
          num_of_like: { $size: "$like" },
        },
      },
      {
        $sort: sortObj,
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
    ]);

    return res.send(foundSite);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 景點資料數(用來計算頁數)
router.get("/sites/count", async (req, res) => {
  let { title, country, region, type, username } = req.query;
  let searchObj = Object.assign(
    {},
    country && { country },
    region && { region },
    type && { type },
    username && { "author.username": { $regex: username, $options: "i" } },
    title && { title: { $regex: title, $options: "i" } }
  );

  try {
    let count = await Site.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1 } }],
          as: "author",
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      { $match: searchObj },
      { $count: "count" },
    ]);

    count = count[0] || { count: 0 };

    return res.send(count);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 特定景點
router.get("/site/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let foundSite = await Site.aggregate([
      {
        $match: {
          _id: new ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "site_id",
          as: "like",
        },
      },
      {
        $lookup: {
          from: "collections",
          localField: "_id",
          foreignField: "site_id",
          as: "collection",
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
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          num_of_like: { $size: "$like" },
          num_of_collection: { $size: "$collection" },
          title: 1,
          country: 1,
          region: 1,
          type: 1,
          content: 1,
          photo: 1,
          "author._id": 1,
          "author.username": 1,
          public: 1,
          updateDate: 1,
        },
      },
    ]);

    foundSite = foundSite[0];

    // 若沒找到資料
    if (!foundSite) {
      return res.status(404).send("無此資料");
    }

    return res.send(foundSite);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 旅程列表
router.get("/tours", async (req, res) => {
  try {
    let { title, username, page, numberPerPage } = req.query;

    let searchObj = Object.assign(
      {},
      title && { title: { $regex: title, $options: "i" } },
      username && { "author.username": { $regex: username, $options: "i" } }
    );

    foundTour = await Tour.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [{ $project: { username: 1 } }],
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      { $match: searchObj },
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
          "author.username": 1,
          "author._id": 1,
        },
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
    ]);

    return res.send(foundTour);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 旅程資料數(用來計算頁數)
router.get("/tours/count", async (req, res) => {
  try {
    let { title, username } = req.query;
    let searchObj = Object.assign(
      {},
      title && { title: { $regex: title, $options: "i" } },
      username && { "author.username": { $regex: username, $options: "i" } }
    );

    let count = await Tour.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [{ $project: { username: 1 } }],
        },
      },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      { $match: searchObj },
      { $count: "count" },
    ]);

    count = count[0] || { count: 0 };

    return res.send(count);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 特定旅程
router.get("/tour/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    // 旅程詳細資訊
    let query1 = () =>
      Tour.aggregate([
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
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
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

    // 旅程每日景點資訊
    let query2 = () =>
      TourSite.aggregate([
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

    let [foundTour, dayPlan] = await Promise.all([query1(), query2()]);

    foundTour = foundTour[0];

    // 若沒找到資料
    if (!foundTour) {
      return res.status(404).send("無此資料");
    }

    return res.send({ foundTour, dayPlan });
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 刪除一個使用者以及他的所有相關物
router.delete("/user/:_id", async (req, res) => {
  try {
    let { _id } = req.params;

    // 防呆
    if (req.user._id === _id) {
      return res.status(400).send("不能刪除自己!");
    }

    // 找使用者、其建立的景點、其建立的旅程
    let [foundUser, site_arr, tour_arr] = await Promise.all([
      User.findOne({ _id: new ObjectId(_id) })
        .select(["photo"])
        .lean()
        .exec(),
      Site.find({ author: new ObjectId(_id) })
        .select(["photo"])
        .lean()
        .exec(),
      Tour.find({ author: new ObjectId(_id) })
        .select(["_id"])
        .lean()
        .exec(),
    ]);

    await Promise.all([
      User.deleteOne({ _id }),
      imgurClient.deleteImage(foundUser.photo.deletehash),
      Site.deleteMany({ author: new ObjectId(_id) }),
      Like.deleteMany({ user_id: new ObjectId(_id) }),
      Collection.deleteMany({ user_id: new ObjectId(_id) }),
      Tour.deleteMany({ author: new ObjectId(_id) }),
      Tourist.deleteMany({ user_id: new ObjectId(_id) }),
    ]);

    site_arr.forEach(async (site) => {
      await Promise.all([
        Like.deleteMany({ site_id: new ObjectId(site._id) }),
        Collection.deleteMany({ site_id: new ObjectId(site._id) }),
        imgurClient.deleteImage(site.photo.deletehash),
      ]);
    });

    tour_arr.forEach(async (tour) => {
      await Promise.all([
        TourSite.deleteMany({ tour_id: new ObjectId(tour._id) }),
        Tourist.deleteMany({ tour_id: new ObjectId(tour._id) }),
      ]);
    });

    return res.send("刪除完畢");
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 刪除一個景點以及他的所有相關物
router.delete("/site/:_id", async (req, res) => {
  try {
    let { _id } = req.params;

    let foundSite = await Site.findOne({ _id: new ObjectId(_id) }).exec();
    if (!foundSite) {
      return res.status(400);
    }

    await Promise.all([
      Site.deleteOne({ _id: new ObjectId(_id) }),
      Like.deleteMany({ site_id: new ObjectId(_id) }),
      Collection.deleteMany({ site_id: new ObjectId(_id) }),
      imgurClient.deleteImage(foundSite.photo.deletehash), // 刪imgur圖片
    ]);

    return res.send("刪除完畢");
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 刪除一個旅程以及他的所有相關物
router.delete("/tour/:_id", async (req, res) => {
  try {
    let { _id } = req.params;

    await Promise.all([
      Tour.deleteOne({ _id: new ObjectId(_id) }),
      Tourist.deleteMany({ tour_id: new ObjectId(_id) }),
      TourSite.deleteMany({ tour_id: new ObjectId(_id) }),
    ]);

    return res.send("刪除完畢");
  } catch (e) {
    console.log(e);
    return res.status(500);
  }
});

module.exports = router;
