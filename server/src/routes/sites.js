const router = require("express").Router();
const Site = require("../models/index").site;
const Like = require("../models/index").like;
const Collection = require("../models/index").collection;
const ObjectId = require("mongoose").Types.ObjectId;
const valid = require("../controllers/validation");
const multer = require("multer");
const path = require("path");
const imgurClient = require("../config/imgur");
const redisClient = require("../config/redis").redisClient_other;
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

// 以關鍵字搜尋景點(公開)
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
    let cacheData = await redisClient.get(`sites_search_hash:${queryHash}`);
    if (cacheData) {
      return res.send(cacheData);
    }

    // 若快取沒有，則搜尋資料庫
    // 設定搜尋條件
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

    // 搜尋
    let foundSite = await Site.aggregate([
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
  let cacheData = await redisClient.get(`sites_search_count_hash:${queryHash}`);
  if (cacheData) {
    return res.send(cacheData);
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

// 找尋自己建立的單一景點詳細資訊 (非公開頁面)
router.get(
  "/mySite/detail/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { _id } = req.params;
    try {
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
        { $unwind: "$author" },
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
    // 先找快取;
    let cacheData = await redisClient.get(`Site:${_id}`);
    if (cacheData) {
      switch (cacheData) {
        case "404":
          return res.status(404).send("無此景點存在");
        case "403":
          return res.status(403).send("作者不公開相關頁面");
        default:
          return res.send(cacheData);
      }
    }

    // 若找不到則搜尋資料庫
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
      { $unwind: "$author" },
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

    // 若景點是公開，則存入快取，時間設定 10 分鐘
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
            public: 1,
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

// 計算使用者的sites總數(用來計算頁數)
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
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: { username: 1 },
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
          type: 1,
          content: 1,
          photo: 1,
          updateDate: 1,
          author: 1,
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

// 找到使用者收藏的景點
router.get(
  "/myCollections",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let user_id = req.user._id;
    let { page, numberPerPage } = req.query;
    try {
      let foundSite = await Collection.aggregate([
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

// 計算使用者收藏的sites總數
router.get(
  "/myCollection/count",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let count = await Collection.find({
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

// 確認有無點過讚或收藏
router.get(
  "/like_collection/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id;
    let user_id = req.user._id;

    try {
      let [like, collection] = await Promise.all([
        Like.findOne({ user_id, site_id }).lean().exec(),
        Collection.findOne({ user_id, site_id }).lean().exec(),
      ]);

      let result = {
        like: like ? true : false,
        collection: collection ? true : false,
      };
      return res.send(result);
    } catch (e) {
      console.log(e);
      return res.status(500).send("伺服器發生問題");
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
        let { error } = valid.sitesValidation(req.body); // title、country、region、type、content、public
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
        let site = new Site(
          Object.assign({}, req.body, {
            public: req.body.public === "true" ? true : false,
            author: req.user._id,
            photo: {
              url,
              deletehash,
              photoName,
            },
          })
        );

        let savedResult = await site.save();

        // 將快取刪掉
        await redisClient.del(`Site_of_author:${req.user._id}`);

        return res.status(201).send(savedResult);
      });
    } catch (e) {
      console.log(e);
      res.status(500).send("伺服器發生問題");
    }
  }
);

// 用戶對景點按讚
router.put(
  "/like/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id; // 景點id
    let user_id = req.user._id; // 使用者id
    try {
      // 確認景點是否存在
      // 先從快取中找景點
      let cacheData = await redisClient.get(`Site:${site_id}`);
      if (cacheData === "404") {
        return res.status(404).send("此景點不存在");
      }

      // 若快取沒有則找資料庫
      let dataFromDatabase;
      if (!cacheData) {
        dataFromDatabase = await Site.findOne({ _id: site_id }).lean().exec();
      }

      // 若景點不存在，返回錯誤
      if (!dataFromRedis && !cacheData) {
        return res.status(404).send("此景點不存在");
      }

      // 存入資料庫
      await Like.findOneAndUpdate(
        { user_id, site_id },
        { user_id, site_id },
        { upsert: true }
      );
      return res.send("成功按讚");
    } catch (e) {
      console.log(e);
      res.status(500).send("伺服器發生問題");
    }
  }
);

// 用戶收藏景點
router.put(
  "/collection/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id; // 景點id
    let user_id = req.user._id; // 使用者id
    try {
      // 確認景點是否存在
      // 先從快取中找景點
      let cacheData = await redisClient.get(`Site:${site_id}`);
      if (cacheData === "404") {
        return res.status(404).send("此景點不存在");
      }

      // 若快取沒有則找資料庫
      let dataFromDatabase;
      if (!cacheData) {
        dataFromDatabase = await Site.findOne({ _id: site_id }).lean().exec();
      }

      // 若景點不存在，返回錯誤
      if (!dataFromRedis && !cacheData) {
        return res.status(404).send("此景點不存在");
      }

      // 存入資料庫
      await Collection.findOneAndUpdate(
        { user_id, site_id },
        { user_id, site_id },
        { upsert: true }
      );
      return res.send("成功收藏");
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
        let { error } = valid.sitesValidation(req.body);
        if (error) {
          console.log("資料", error);
          return res.status(400).send(error.details[0].message);
        }

        let { removeOriginPhoto, public } = req.body;

        // 新圖片上傳 imgur ，取得 url 及 deleteHash
        let url;
        let deletehash;
        let photoName;

        // 若要求刪除舊照片 or 有更新成新照片
        if (removeOriginPhoto === "true") {
          await imgurClient.deleteImage(foundSite.photo.deletehash);
        }

        let newPhoto;
        // 上傳新照片
        if (req.files.length !== 0) {
          const response = await imgurClient.upload({
            image: req.files[0].buffer.toString("base64"),
            type: "base64",
            album: process.env.IMGUR_ALBUM_ID,
          });

          url = response.data.link;
          deletehash = response.data.deletehash;
          photoName = req.files[0].originalname;

          newPhoto = { photo: { url, deletehash, photoName } };
        } else {
          if (removeOriginPhoto === "true") {
            newPhoto = { photo: { url: "", deletehash: "", photoName: "" } };
          } else {
            newPhoto = {};
          }
        }

        // 將景點資訊儲存至資料庫
        let newData = Object.assign({}, req.body, newPhoto, {
          public: public === "true" ? true : false,
          updateDate: Date.now(),
        });

        await Promise.all([
          Site.findOneAndUpdate({ _id }, newData, {
            // 更新資料庫資料
            runValidators: true,
          }),
          redisClient.del(`Site:${_id}`), // 刪快取
        ]);

        return res.send("成功更新資料");
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
        return res.status(404).send("無此景點存在");
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
        Collection.deleteMany({ site_id: new ObjectId(_id) }), // 從收藏資料庫中移除
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

// 用戶對景點按讚或收回讚
router.delete(
  "/like/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id; // 景點id
    let user_id = req.user._id; // 使用者id
    try {
      await Like.deleteOne({ user_id, site_id }).exec();
      return res.send("成功收回讚");
    } catch (e) {
      console.log(e);
      res.status(500).send("伺服器發生問題");
    }
  }
);

// 用戶對景點收藏或取消收藏
router.delete(
  "/collection/:_id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let site_id = req.params._id; // 景點id
    let user_id = req.user._id; // 使用者id
    try {
      await Collection.deleteOne({ user_id, site_id }).exec();
      return res.send("成功取消收藏");
    } catch (e) {
      console.log(e);
      res.status(500).send("伺服器發生問題");
    }
  }
);

module.exports = router;
