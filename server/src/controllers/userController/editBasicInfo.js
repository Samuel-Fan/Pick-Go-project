const User = require("../../models").User;
const valid = require("../otherController/validation");
const multer = require("multer");
const path = require("path");
const imgurClient = require("../../config/imgur");
const redisClient = require("../../config/redis").redisClient_user;

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
  let { _id } = req.user;
  try {
    // 確認有無此人
    let foundUser = await User.findOne({ _id }).select("photo").lean().exec();
    if (!foundUser) {
      return res.status(404).send("無搜尋到此用戶");
    }

    // 上傳格式formData
    upload(req, res, async (err) => {
      // req.files 包含 圖片檔案
      // req.body 包含 key-value 資料

      // 如圖片規格不符 multer 設定(大小、格式)，則返回 error 訊息
      if (err) {
        console.log(err);
        return res.status(400).send(err.message);
      }

      // 驗證填入資料的正確性，如果不合規範則 return 錯誤
      let { error } = valid.editBasicValidation(req.body); // req.body 應有 username, age, gender, description, public, removeOriginPhoto
      if (error) {
        console.log(error);
        return res.status(400).send(error.details[0].message);
      }

      let { removeOriginPhoto, public } = req.body;

      // 新圖片上傳 imgur ，取得 url 及 deleteHash
      let url;
      let deletehash;
      let photoName;

      // 若要求刪除舊照片 or 有更新成新照片
      if (removeOriginPhoto === "true") {
        await imgurClient.deleteImage(foundUser.photo.deletehash);
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
      });

      let [data] = await Promise.all([
        User.findOneAndUpdate({ _id }, newData, {
          // 更新資料
          new: true,
          runValidators: true,
        }),
        redisClient.del(`public_user_${_id}`),
      ]);

      return res.send(data);
    });
  } catch (e) {
    next(e);
  }
};
