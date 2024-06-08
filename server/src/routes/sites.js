const router = require("express").Router();
const Site = require("../models/index").site;
const Like = require("../models/index").like;
const Collect = require("../models/index").collect;
const ObjectId = require("mongoose").Types.ObjectId;
const valid = require("../controllers/validation");
const multer = require("multer");
const path = require("path");
const imgurClient = require("../config/imgur");
const redisClient = require("../config/redis");
const passport = require("passport");
const hash = require("object-hash");

// 照片檔案上傳格式設定
const upload = multer({
  limits: {
    fileSize: 2.5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      cb({ message: '"檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"' });
    }
    cb(null, true);
  },
}).any();

// <<測試用>> 得到全部景點
router.get("/all", async (req, res) => {
  let foundSite = await Site.find({})
    .populate("author", ["username"])
    .lean()
    .exec();
  return res.send(foundSite);
});

// <<測試用>> 得到全部景點
router.get("/test", (req, res) => {
  Site.find({ author: req.user._id })
    .explain("executionStats")
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.log(e);
    });
});

// 以關鍵字搜尋景點
router.get("/search", async (req, res) => {
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

    // 先搜尋快取中有沒有
    let queryHash = hash.sha1(req.query);
    let dataFromRedis = await redisClient.get(`sites_search_hash:${queryHash}`);
    if (dataFromRedis) {
      console.log("利用快取給予搜尋資料");
      return res.send(dataFromRedis);
    }

    // 若快取沒有，則搜尋資料庫
    let searchObj = Object.assign(
      {},
      country && { country },
      region && { region },
      type && { type },
      username && { "author.username": { $regex: username, $options: "i" } },
      title && { title: { $regex: title, $options: "i" } },
      { public: true }
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
      { $unwind: "$author" },
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
          num_of_like: { $size: "$like" },
          title: 1,
          country: 1,
          region: 1,
          type: 1,
          content: 1,
          photo: 1,
          updateDate: 1,
          "author._id": 1,
          "author.username": 1,
        },
      },
      {
        $sort: sortObj,
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
    ]);
    console.log("利用資料庫提供搜尋資料");

    // 存入快取，過期時間先設定短一點(方便展示project用)
    await redisClient.set(
      `sites_search_hash:${queryHash}`,
      JSON.stringify(foundSite),
      {
        EX: 1 * 60 * 1,
      }
    );

    return res.send(foundSite);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 公開景點資料數(用來計算頁數)
router.get("/count", async (req, res) => {
  // 先搜尋快取中有沒有
  let queryHash = hash.sha1(req.query);
  let dataFromRedis = await redisClient.get(
    `sites_search_count_hash:${queryHash}`
  );
  if (dataFromRedis) {
    console.log("利用快取搜尋頁數");
    return res.send(dataFromRedis);
  }

  let { title, country, region, type, username } = req.query;
  let searchObj = Object.assign(
    {},
    country && { country },
    region && { region },
    type && { type },
    username && { "author.username": { $regex: username, $options: "i" } },
    title && { title: { $regex: title, $options: "i" } },
    { public: true }
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
      { $unwind: "$author" },
      { $match: searchObj },
      { $count: "count" },
    ]);

    count = count[0] || { count: 0 };

    // 存入快取，過期時間與search一致
    await redisClient.set(
      `sites_search_count_hash:${queryHash}`,
      JSON.stringify(count),
      {
        EX: 1 * 60 * 1,
      }
    );

    return res.send(count);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 找尋單個景點詳細資訊 (非公開頁面)
router.get(
  "/mySite/detail/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params;
    try {
      // 先搜尋快取中有無數據
      let dataFromRedis = await redisClient.get(`Site:${_id}`);
      if (dataFromRedis === "404") {
        console.log("利用快取返回404 error");
        return res.status(404).send("錯誤");
      }

      if (dataFromRedis && dataFromRedis !== "403") {
        console.log("利用快取提供景點資料");
        return res.send(dataFromRedis);
      }

      // 若找不到則搜尋資料庫
      console.log("利用資料庫提取景點資料");

      let foundSite = await Site.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
            author: new ObjectId(req.user._id),
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
            from: "collects",
            localField: "_id",
            foreignField: "site_id",
            as: "collect",
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
            num_of_like: { $size: "$like" },
            num_of_collect: { $size: "$collect" },
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
        // 找不到資料也存進快取，防快取穿透 Cache Penetration
        await redisClient.set(`Site:${_id}`, "404", {
          EX: 60 * 60 * 1,
        });
        return res.status(404).send("無此資料");
      }

      // 若site是公開，則存入快取，時間設定 30-60 分鐘
      let randomTime = Math.floor(Math.random() * 31) + 30; // 使用隨機數，防快取雪崩 Cache Avalanche
      if (foundSite.public) {
        await redisClient.set(`Site:${_id}`, JSON.stringify(foundSite), {
          EX: randomTime * 60 * 1,
        });
      }

      return res.send(foundSite);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 找尋單個景點詳細資訊 (公開頁面)
router.get("/detail/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    // 先搜尋快取中有無數據
    let dataFromRedis = await redisClient.get(`Site:${_id}`);
    if (dataFromRedis) {
      if (dataFromRedis === "404") {
        console.log("利用快取返回404 error");
        return res.status(404).send("錯誤");
      }

      if (dataFromRedis === "403") {
        console.log("快取中發現此資料不公開");
        return res.status(403).send("作者不公開相關頁面");
      }
      console.log("利用快取提供景點資料");
      return res.send(dataFromRedis);
    }

    // 若找不到則搜尋資料庫
    console.log("利用資料庫提取景點資料");

    let foundSite = await Site.aggregate([
      { $match: { _id: new ObjectId(_id) } },
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
          from: "collects",
          localField: "_id",
          foreignField: "site_id",
          as: "collect",
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
          num_of_like: { $size: "$like" },
          num_of_collect: { $size: "$collect" },
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
      // 找不到資料也存進快取，防快取穿透 Cache Penetration
      await redisClient.set(`Site:${_id}`, "404", {
        EX: 60 * 60 * 1,
      });
      return res.status(404).send("無此資料");
    }

    // 若搜尋到則確認其是否公開，若不公開則返回403錯誤
    if (!foundSite.public) {
      await redisClient.set(`Site:${_id}`, "403", {
        // 防快取穿透 Cache Penetration，其實期限可以設久一點
        EX: 60 * 60 * 1,
      });
      return res.status(403).send("作者不公開相關頁面");
    }

    // 若site是公開，則存入快取，時間設定 10 分鐘
    if (foundSite.public) {
      await redisClient.set(`Site:${_id}`, JSON.stringify(foundSite), {
        EX: 10 * 60 * 1,
      });
    }

    return res.send(foundSite);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 計算使用者的sites總數
router.get(
  "/mySite/count",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    try {
      let count = await Site.find({ author: new ObjectId(_id) })
        .count()
        .exec();
      return res.send({ count });
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 找尋登入使用者建立的景點
router.get(
  "/mySite",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.user;
    let { page, numberPerPage } = req.query;
    try {
      let foundSite = await Site.aggregate([
        { $match: { author: new ObjectId(_id) } },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "site_id",
            as: "likes",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
            pipeline: [
              {
                $project: {
                  username: 1,
                },
              },
            ],
          },
        },
        { $unwind: "$author" },
        {
          $project: {
            title: 1,
            country: 1,
            region: 1,
            content: 1,
            status: 1,
            photo: 1,
            updateDate: 1,
            "author._id": 1,
            "author.username": 1,
            num_of_like: { $size: "$likes" },
          },
        },
        { $skip: (page - 1) * numberPerPage },
        { $limit: Number(numberPerPage) },
      ]);

      return res.send(foundSite);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 找尋特定作者的其他site，排除query給予的site_id
router.get("/other", async (req, res) => {
  let { author_id, site_id } = req.query;

  try {
    let foundSite = await Site.aggregate([
      {
        $match: {
          author: new ObjectId(author_id),
          _id: { $ne: new ObjectId(site_id) },
          public: true,
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
        $project: {
          title: 1,
          country: 1,
          region: 1,
          type: 1,
          content: 1,
          photo: 1,
          updateDate: 1,
          num_of_like: { $size: "$like" },
        },
      },
      { $sample: { size: 3 } },
    ]);

    return res.send(foundSite);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 計算使用者收藏的sites總數
router.get(
  "/myCollection/count",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let count = await Collect.find({
        user_id: new ObjectId(req.user._id),
      })
        .count()
        .exec();
      return res.send({ count });
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 找到使用者收藏的景點
router.get(
  "/myCollections",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let user_id = req.user._id;
    let { page, numberPerPage } = req.query;
    try {
      let foundSite = await Collect.aggregate([
        { $match: { user_id: new ObjectId(user_id) } },
        {
          $lookup: {
            from: "sites",
            localField: "site_id",
            foreignField: "_id",
            as: "site",
          },
        },
        { $unwind: "$site" },
        {
          $lookup: {
            from: "likes",
            localField: "site_id",
            foreignField: "site_id",
            as: "like",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "site.author",
            foreignField: "_id",
            as: "site.author",
            pipeline: [
              {
                $project: { username: 1 },
              },
            ],
          },
        },
        { $unwind: "$site.author" },
        {
          $project: {
            num_of_like: { $size: "$like" },
            _id: "$site._id",
            title: "$site.title",
            country: "$site.country",
            region: "$site.region",
            type: "$site.type",
            content: "$site.content",
            photo: "$site.photo",
            updateDate: "$site.updateDate",
            author: "$site.author",
          },
        },
        { $skip: (page - 1) * numberPerPage },
        { $limit: Number(numberPerPage) },
      ]);

      return res.send(foundSite);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 確認有無點過讚或收藏
router.get(
  "/check/like-collect/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id;
    let user_id = req.user._id;

    try {
      let like = await Like.findOne({ user_id, site_id }).lean().exec();
      let collect = await Collect.findOne({ user_id, site_id }).lean().exec();
      let result = {
        like: like ? true : false,
        collect: collect ? true : false,
      };
      return res.send(result);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

// 用戶對景點按讚或收回讚
router.post(
  "/click/like/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id; // 景點id
    let user_id = req.user._id; // 使用者id
    try {
      // 先確認有無點過讚，如有點過，則收回讚
      let checkLike = await Like.findOne({
        user_id,
        site_id,
      }).exec();
      if (checkLike) {
        await Like.deleteOne({ user_id, site_id }).exec();
        return res.send("成功收回讚");
      }

      let dataFromDatabase;
      // 先從快取中找景點

      let dataFromRedis = await redisClient.get(`Site:${site_id}`);
      if (!dataFromRedis) {
        dataFromDatabase = await Site.findOne({ _id: site_id }).exec();
      }

      let foundSite = dataFromRedis || dataFromDatabase;
      // 確認景點有無存在
      // 若景點不存在，返回錯誤
      if (!foundSite) {
        return res.status(400).send("此景點不存在");
      }

      // 存入資料庫
      let like = new Like({ user_id, site_id });
      await like.save();
      return res.send("成功按讚");
    } catch (e) {
      console.log(e);
      res.status(500).send("伺服器發生問題");
    }
  }
);

// 用戶對景點收藏或取消收藏
router.post(
  "/click/collect/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id; // 景點id
    let user_id = req.user._id; // 使用者id
    try {
      // 先確認有無點過收藏，如有點過，則取消收藏
      let checkCollect = await Collect.findOne({
        user_id,
        site_id,
      }).exec();
      if (checkCollect) {
        await Collect.deleteOne({ user_id, site_id }).exec();
        return res.send("成功取消收藏");
      }

      let dataFromDatabase;
      // 先從快取中找景點

      let dataFromRedis = await redisClient.get(`Site:${site_id}`);
      if (!dataFromRedis) {
        dataFromDatabase = await Site.findOne({ _id: site_id }).exec();
      }

      let foundSite = dataFromRedis || dataFromDatabase;
      // 確認景點有無存在
      // 若景點不存在，返回錯誤
      if (!foundSite) {
        return res.status(400).send("此景點不存在");
      }

      // 存入資料庫
      let collect = new Collect({ user_id, site_id });
      await collect.save();
      return res.send("成功收藏");
    } catch (e) {
      console.log(e);
      res.status(500).send("伺服器發生問題");
    }
  }
);

// 新增新的景點
router.post(
  "/new",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    try {
      upload(req, res, async (err) => {
        // req.files 包含 圖片檔案
        // req.body 包含 key-value 資料

        // 如圖片規格不符 multer 設定(大小、格式)，則返回 error 訊息
        if (err) {
          console.log(err);
          return res.status(400).send(err.message);
        }

        // 如景點規格不符，則返回客製化錯誤訊息
        let { title, country, region, type, content } = req.body;
        let { error } = valid.sitesValidation({
          title,
          country,
          region,
          type,
          content,
        });
        if (error) {
          console.log("資料", error);
          return res.status(400).send(error.details[0].message);
        }

        // 圖片上傳 imgur ，取得 url 及 deleteHash
        let url;
        let deletehash;
        let photoName;
        if (req.files.length !== 0) {
          const response = await imgurClient.upload({
            image: req.files[0].buffer.toString("base64"),
            type: "base64",
            album: process.env.IMGUR_ALBUM_ID,
          });

          url = response.data.link;
          deletehash = response.data.deletehash;
          photoName = req.files[0].originalname;
        }

        // 將景點資訊儲存至資料庫
        let site = new Site({
          title,
          country,
          region,
          type,
          content,
          author: req.user._id,
          photo: {
            url,
            deletehash,
            photoName,
          },
        });

        let savedResult = await site.save();

        // 將快取刪掉
        await redisClient.del(`Site_of_author:${req.user._id}`);

        return res.send(savedResult);
      });
    } catch (e) {
      console.log(e);
      res.status(500).send("伺服器發生問題");
    }
  }
);

// 更新景點
router.patch(
  "/modify/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params; // 景點id
    try {
      let foundSite = await Site.findOne({ _id }).lean().exec();
      // 確認有無此景點
      if (!foundSite) {
        return res.status(400).send("無此景點存在");
      }

      let author = foundSite.author;

      // 確認是作者本人
      if (!author.equals(req.user._id)) {
        return res.status(403).send("必須是本人才能編輯");
      }

      upload(req, res, async (err) => {
        // req.files 包含 圖片檔案
        // req.body 包含 key-value 資料

        // 如圖片規格不符 multer 設定(大小、格式)，則返回 error 訊息
        if (err) {
          console.log(err);
          return res.status(400).send(err.message);
        }

        // 如景點規格不符，則返回客製化錯誤訊息
        let {
          title,
          country,
          region,
          type,
          content,
          removeOriginPhoto,
          public,
        } = req.body;

        let { error } = valid.sitesValidation({
          title,
          country,
          region,
          type,
          content,
        });
        if (error) {
          console.log("資料", error);
          return res.status(400).send(error.details[0].message);
        }

        // 新圖片上傳 imgur ，取得 url 及 deleteHash
        let url;
        let deletehash;
        let photoName;

        // 若要求刪除舊照片 or 有更新成新照片
        if (removeOriginPhoto === "true") {
          await imgurClient.deleteImage(foundSite.photo.deletehash);
        }

        if (req.files.length !== 0) {
          // 如果原本有圖片，先把舊的刪掉，再更新成新的

          const response = await imgurClient.upload({
            image: req.files[0].buffer.toString("base64"),
            type: "base64",
            album: process.env.IMGUR_ALBUM_ID,
          });

          url = response.data.link;
          deletehash = response.data.deletehash;
          photoName = req.files[0].originalname;
        }

        // 將景點資訊儲存至資料庫
        let newData = {
          title,
          country,
          region,
          type,
          content,
          photo: {
            url: removeOriginPhoto === "true" ? url : foundSite.photo.url,
            deletehash:
              removeOriginPhoto === "true"
                ? deletehash
                : foundSite.photo.deletehash,
            photoName:
              removeOriginPhoto === "true"
                ? photoName
                : foundSite.photo.photoName,
          },
          public: public === "true" ? true : false,
          updateDate: Date.now(),
        };

        await Promise.all([
          Site.findOneAndUpdate({ _id }, newData, {
            // 更新資料庫資料
            runValidators: true,
          }),
          redisClient.del(`Site:${_id}`), // 刪快取
        ]);

        return res.send({ message: "成功更新資料" });
      });
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
    let { _id } = req.params; // 景點id

    try {
      let foundSite = await Site.findOne({ _id }).lean().exec();

      // 確認有無此景點
      if (!foundSite) {
        return res.status(400).send("無此景點存在");
      }

      let author = foundSite.author;

      // 確認是作者本人
      if (!author.equals(req.user._id)) {
        return res.status(403).send("必須是本人才能刪除資料");
      }

      let deletehash = foundSite.photo.deletehash;

      await Promise.all([
        Site.deleteOne({ _id }), // 從景點資料庫移除
        Like.deleteMany({ site_id: new ObjectId(_id) }), // 從讚資料庫中移除
        Collect.deleteMany({ site_id: new ObjectId(_id) }), // 從收藏資料庫中移除
        imgurClient.deleteImage(deletehash), // 刪imgur圖片
        redisClient.del(`Site:${_id}`), // 刪快取
      ]);

      return res.send("成功刪除資料");
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
    }
  }
);

module.exports = router;
