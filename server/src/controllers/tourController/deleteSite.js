const { TourSite } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  let { _id } = req.params; // tourSite_id
  try {
    let foundSite = await TourSite.findOne({ _id })
      .populate("tour_id", ["author"])
      .select("tour_id")
      .lean()
      .exec();

    // 若找不到景點，返回錯誤
    if (!foundSite) {
      return res.status(404).send("找不到相關景點");
    }

    // 非本人編輯，返回錯誤
    if (!foundSite.tour_id.author.equals(req.user._id)) {
      return res.status(403).send("只有主辦人才能刪除");
    }

    // 刪除行程
    await Promise.all([
      TourSite.deleteOne({ _id }),
      redisClient.del(`Tour:${foundSite.tour_id._id}`), // 刪快取
    ]);

    return res.send("成功刪除");
  } catch (e) {
    next(e);
  }
};
