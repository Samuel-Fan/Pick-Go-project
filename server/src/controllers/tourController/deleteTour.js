const { Tour, TourSite, Tourist } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  try {
    let { _id } = req.params;
    let foundTour = await Tour.findOne({ _id }).lean().exec();
    // 若無相關旅程
    if (!foundTour) {
      return res.status(404).send("無搜尋到相關旅程");
    }

    // 若非本人刪除
    if (!foundTour.author.equals(req.user._id)) {
      return res.status(403).send("本人才能刪除");
    }

    await Promise.all([
      Tour.findOneAndDelete({ _id }),
      TourSite.deleteMany({ tour_id: _id }),
      Tourist.deleteMany({ tour_id: _id }),
      redisClient.del(`Tour:${_id}`),
    ]);

    return res.send("成功刪除");
  } catch (e) {
    next(e);
  }
};
