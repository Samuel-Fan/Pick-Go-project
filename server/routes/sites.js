const router = require("express").Router();
const Site = require("../models/index").site;
const User = require("../models/index").user;
const valid = require("../validation");
const multer = require("multer");
const path = require("path");
const { ImgurClient } = require("imgur");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.status(401).send("您需要先重新登入系統");
  }
};

const upload = multer({
  limits: {
    fileSize: 1 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") {
      cb("檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。");
    }
    cb(null, true);
  },
}).any();

router.get("/", async (req, res) => {
  try {
    let foundData = await Site.find().exec();
    console.log(foundData);
    return res.send(foundData);
  } catch (e) {
    res.status(500).send("伺服器發生問題");
  }
});

// 測試用 得到全部景點
router.get("/all", async (req, res) => {
  let foundSite = await Site.find({}).populate("author", ["username"]);
  res.send(foundSite);
});

// 找尋特定景點
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  console.log(_id);
  try {
    let foundSite = await Site.findOne({ _id })
      .populate("author", ["username", "email"])
      .exec();
    res.send(foundSite);
  } catch (e) {
    console.log(e);
  }
});

router.post("/", function (req, res, next) {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.status(400).send(err);
      }

      const client = new ImgurClient({
        clientId: process.env.IMGUR_CLIENTID,
        clientSecret: process.env.IMGUR_CLIENT_SECRET,
        refreshToken: process.env.IMGUR_REFRESH_TOKEN,
      });

      const response = await client.upload({
        image: req.files[0].buffer.toString("base64"),
        type: "base64",
        album: process.env.IMGUR_ALBUM_ID,
      });

      let site = new Site({ link: response.data.link });
      await site.save();
      res.send({ url: response.data.link });
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("伺服器發生問題");
  }
});

// 新增新的景點 (照片另外處理)
router.post("/new", authCheck, async (req, res) => {
  let { error } = valid.sitesValidation(req.body); // req.body 應含 title, country, region, type, content
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  try {
    let foundUser = await User.findOne({ _id: req.user._id }).exec(); // 確認是哪個使用者在新增景點
    if (!foundUser) {
      return res.status(400).send("請重新登入");
    }

    let { title, country, region, type, content } = req.body;
    let site = new Site({
      title,
      country,
      region,
      type,
      content,
      author: req.user._id,
    });
    let savedSite = await site.save();

    let siteId = savedSite._id;
    foundUser.mySite.push(siteId);
    await foundUser.save();

    res.send("資料已儲存完畢!");
  } catch (e) {
    console.log(e);
    res.status(500).send("伺服器發生問題");
  }
});

module.exports = router;
