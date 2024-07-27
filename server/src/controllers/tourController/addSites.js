const { Tour, TourSite } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  let { _id } = req.params;

  // 確認本人編輯
  let foundTour = await Tour.findOne({ _id }).select("author").lean().exec();
  if (!foundTour) {
    return res.status(404).send("找不到相關旅程");
  }

  if (!foundTour.author.equals(req.user._id)) {
    return res.status(403).send("本人才能編輯");
  }

  let site_arr = req.body;
  try {
    if (site_arr.length === 0) {
      return res.send("無任何資料新增");
    }

    site_arr.map((site) => (site.tour_id = _id));

    await Promise.all([
      TourSite.insertMany(site_arr),
      redisClient.del(`Tour:${_id}`), // 刪快取
    ]);

    return res.status(201).send("已新增景點");
  } catch (e) {
    next(e);
  }
};
