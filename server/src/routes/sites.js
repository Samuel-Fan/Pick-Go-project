const router = require("express").Router();
const Site = require("../models/index").site;
const Action = require("../models/index").action;
const ObjectId = require("mongoose").Types.ObjectId;
const valid = require("../controllers/validation");
const multer = require("multer");
const path = require("path");
const imgurClient = require("../config/imgur");
const redisClient = require("../config/redis");

// 檢查有無登入
const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).send("您需要先重新登入系統");
  }
};

// 照片檔案上傳格式設定
const upload = multer({
  limits: {
    fileSize: 1 * 1024 * 1024,
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
  let foundSite = await Site.find({}).populate("author", ["username"]);
  return res.send(foundSite);
});

// 找尋特定景點
router.get("/detail/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    // 先搜尋快取中有無數據;
    let dataFromRedis = await redisClient.get(`Site:${_id}`);
    if (dataFromRedis) {
      console.log("利用快取提供資料");
      return res.send(dataFromRedis);
    }

    // 若找不到則搜尋資料庫
    console.log("利用資料庫提取資料");
    let foundSite = await Site.findOne({ _id })
      .populate("author", ["username"])
      .exec();
    // 搜尋site有幾個讚、收藏
    let like = await Action.find({ site_id: new ObjectId(_id), action: "讚" })
      .count()
      .exec();
    let collect = await Action.find({
      site_id: new ObjectId(_id),
      action: "收藏",
    })
      .count()
      .exec();

    // 存入快取，時間設定 10 分鐘
    await redisClient.set(
      `Site:${_id}`,
      JSON.stringify({ site: foundSite, like, collect }),
      {
        EX: 10 * 60 * 1,
      }
    );

    return res.send({ site: foundSite, like, collect });
  } catch (e) {
    return res.status(500).send("伺服器發生問題");
  }
});

// 計算使用者的sites總數
router.get("/mySite/count", authCheck, async (req, res) => {
  let { _id } = req.user;
  try {
    let count = await Site.find({ author: _id }).count().exec();
    return res.send({ count });
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 找尋登入使用者建立的景點
router.get("/mySite", authCheck, async (req, res) => {
  let { _id } = req.user;
  let { page, numberPerPage } = req.query;
  try {
    // 先搜尋快取中有無數據;
    let dataFromRedis = await redisClient.get(`Site_of_author:${_id}`);
    if (dataFromRedis) {
      console.log("利用快取提供資料");
      let data = JSON.parse(dataFromRedis).slice(
        (page - 1) * numberPerPage,
        page * numberPerPage
      );
      return res.send(data);
    }

    let foundSite = await Site.find({ author: _id }).exec();
    console.log("利用資料庫存取資料");
    // 存入快取，時間設定 30 分鐘
    await redisClient.set(`Site_of_author:${_id}`, JSON.stringify(foundSite), {
      EX: 30 * 60 * 1,
    });

    return res.send(
      foundSite.slice((page - 1) * numberPerPage, page * numberPerPage)
    );
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

// 用戶對景點按讚或收回讚
router.get("/click/like/:_id", authCheck, async (req, res) => {
  let site_id = req.params._id; // 景點id
  let user_id = req.user._id; // 使用者id
  try {
    // 先確認有無點過讚，如有點過，則收回讚
    let checkLike = await Action.findOne({
      user_id,
      site_id,
      action: "讚",
    }).exec();
    if (checkLike) {
      await Action.deleteOne({ user_id, site_id, action: "讚" }).exec();
      return res.send("成功收回讚");
    }

    let dataFromDatabase;
    // 先從快取中找景點

    let dataFromRedis = await redisClient.get(`Site:${site_id}`);
    if (!dataFromRedis) {
      dataFromDatabase = await Site.findOne({ _id: site_id }).exec();
    }

    let foundSite = dataFromRedis || dataFromDatabase;
    console.log(dataFromRedis, dataFromDatabase);
    // 確認景點有無存在
    // 若景點不存在，返回錯誤
    if (!foundSite) {
      return res.status(400).send("此景點不存在");
    }

    // 存入資料庫
    let action = new Action({ user_id, site_id, action: "讚" });
    await action.save();
    return res.send("成功按讚");
  } catch (e) {
    console.log(e);
    res.status(500).send("伺服器發生問題");
  }
});

// 用戶對景點收藏或取消收藏
router.get("/click/collect/:_id", authCheck, async (req, res) => {
  let site_id = req.params._id; // 景點id
  let user_id = req.user._id; // 使用者id
  try {
    // 先確認有無點過收藏，如有點過，則取消收藏
    let checkCollect = await Action.findOne({
      user_id,
      site_id,
      action: "收藏",
    }).exec();
    if (checkCollect) {
      await Action.deleteOne({ user_id, site_id, action: "收藏" }).exec();
      return res.send("成功取消收藏");
    }

    let dataFromDatabase;
    // 先從快取中找景點

    let dataFromRedis = await redisClient.get(`Site:${site_id}`);
    if (!dataFromRedis) {
      dataFromDatabase = await Site.findOne({ _id: site_id }).exec();
    }

    let foundSite = dataFromRedis || dataFromDatabase;
    console.log(dataFromRedis, dataFromDatabase);
    // 確認景點有無存在
    // 若景點不存在，返回錯誤
    if (!foundSite) {
      return res.status(400).send("此景點不存在");
    }

    // 存入資料庫
    let action = new Action({ user_id, site_id, action: "收藏" });
    await action.save();
    return res.send("成功收藏");
  } catch (e) {
    console.log(e);
    res.status(500).send("伺服器發生問題");
  }
});

// 新增新的景點
router.post("/new", authCheck, (req, res) => {
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
      console.log(title, country, region, type, content);
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
});

// 更新景點
router.patch("/modify/:_id", authCheck, async (req, res) => {
  let { _id } = req.params; // 景點id
  try {
    let foundSite = await Site.findOne({ _id }).exec();

    // 確認有無此景點
    if (!foundSite) {
      return res.status(400).send("無此景點存在");
    }

    let author = foundSite.author;

    // 確認是作者本人
    if (!author.equals(req.user._id)) {
      return res.status(401).send("必須是本人才能編輯");
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
      let { title, country, region, type, content, removeOriginPhoto, public } =
        req.body;

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
      let updateResult = await Site.findOneAndUpdate({ _id }, newData, {
        new: true,
        runValidators: true,
      });

      // 將快取刪掉
      await redisClient.del(`Site_of_author:${req.user._id}`);
      await redisClient.del(`Site:${_id}`);

      return res.send({ message: "成功更新資料", updateResult });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

router.delete("/:_id", authCheck, async (req, res) => {
  let { _id } = req.params; // 景點id

  try {
    let foundSite = await Site.findOne({ _id }).exec();

    // 確認有無此景點
    if (!foundSite) {
      return res.status(400).send("無此景點存在");
    }

    let author = foundSite.author;

    // 確認是作者本人
    if (!author.equals(req.user._id)) {
      return res.status(401).send("必須是本人才能刪除資料");
    }

    let deletehash = foundSite.photo.deletehash;
    await Site.deleteOne({ _id });
    await imgurClient.deleteImage(deletehash);

    // 將快取刪掉
    await redisClient.del(`Site_of_author:${req.user._id}`);
    await redisClient.del(`Site:${_id}`);

    return res.send("成功刪除資料");
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

module.exports = router;
