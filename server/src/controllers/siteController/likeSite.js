const { Site, Like } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
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
    if (!dataFromDatabase && !cacheData) {
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
    next(e);
  }
};
