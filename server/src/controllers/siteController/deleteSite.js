const { Site, Like, Collection } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;
const imgurClient = require("../../config/imgur");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
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
    next(e);
  }
};
