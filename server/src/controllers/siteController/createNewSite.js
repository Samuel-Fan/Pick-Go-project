const { Site } = require("../../models");
const valid = require("../otherController/validation");
const multer = require("multer");
const path = require("path");
const imgurClient = require("../../config/imgur");

// 照片檔案上傳格式設定
const upload = multer({
  limits: {
    fileSize: 2.5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".jpg", ".jpeg", ".png"].includes(ext)) {
      cb({ message: '"檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。"' });
    }
    cb(null, true);
  },
}).any();

module.exports = async (req, res, next) => {
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

      return res.status(201).send(savedResult);
    });
  } catch (e) {
    next(e);
  }
};
