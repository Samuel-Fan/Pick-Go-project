const router = require("express").Router();
const Site = require("../models/index").site;
const User = require("../models/index").user;
const valid = require("../validation");
const multer = require("multer");
const path = require("path");
const { ImgurClient } = require("imgur");
const redis = require("redis");
const redisClient = require("../redis");

// imgur 設定
const imgurClient = new ImgurClient({
  clientId: process.env.IMGUR_CLIENTID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN,
});

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
    let foundSite = await Site.findOne({ _id })
      .populate("author", ["username", "email"])
      .exec();
    return res.send(foundSite);
  } catch (e) {
    return res.status(500).send("伺服器發生問題");
  }
});

// 找尋登入使用者建立的景點
router.get("/mySite", authCheck, async (req, res) => {
  let { _id } = req.user;
  try {
    // 先搜尋快取中有無數據
    let dataFromRedis = await redisClient.get(`Site_of_author:${_id}`);
    if (dataFromRedis) {
      console.log("利用快取提供資料");
      return res.send(JSON.parse(dataFromRedis));
    }

    let foundSite = await Site.find({ author: _id }).exec();
    console.log("利用資料庫存取資料");
    // 存入快取，時間設定 30 分鐘
    await redisClient.set(`Site_of_author:${_id}`, JSON.stringify(foundSite), {
      EX: 30 * 60 * 1,
    });

    return res.send(foundSite);
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
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
  let { _id } = req.params;
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
      let { title, country, region, type, content, removeOriginPhoto } =
        req.body;
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
        updateDate: Date.now(),
      };
      let updateResult = await Site.findOneAndUpdate({ _id }, newData, {
        new: true,
        runValidators: true,
      });

      // 將快取刪掉
      await redisClient.del(`Site_of_author:${req.user._id}`);

      return res.send({ message: "成功更新資料", updateResult });
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

router.delete("/:_id", authCheck, async (req, res) => {
  let { _id } = req.params;
  console.log(_id);
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

    return res.send("成功刪除資料");
  } catch (e) {
    console.log(e);
    return res.status(500).send("伺服器發生問題");
  }
});

module.exports = router;
