const router = require("express").Router();
const Site = require("../models/index").site;
const valid = require("../validation");
const multer = require("multer");
const path = require("path");
const { ImgurClient } = require("imgur");

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

module.exports = router;
