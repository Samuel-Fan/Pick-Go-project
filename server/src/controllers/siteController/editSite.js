const { Site } = require("../../models");
const valid = require("../otherController/validation");
const multer = require("multer");
const path = require("path");
const imgurClient = require("../../config/imgur");
const redisClient = require("../../config/redis").redisClient_other;

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
    next(e);
  }
};
