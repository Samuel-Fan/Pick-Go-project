const { Tourist } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  try {
    let { _id } = req.params; // tourist_id

    let info = await Tourist.findOne({ _id })
      .populate("tour_id", ["author"])
      .lean()
      .exec();

    // 確認有無該申請者/參加者
    if (!info) {
      return res.status(404).send("無找到相關參加者");
    }

    // 若該旅程不存在
    if (!info.tour_id) {
      return res.status(404).send("該旅程不存在");
    }

    // 若非本人或旅程主辦者本人操作
    if (
      !info.user_id.equals(req.user._id) &&
      !info.tour_id.author.equals(req.user._id)
    ) {
      return res.status(403).send("只有本人或主辦者才能操作");
    }

    // 主辦者無法被刪掉
    if (info.tour_id.author.equals(info.user_id)) {
      return res.status(400).send("不可以刪掉主辦人");
    }

    // 若以上都沒問題，則刪去該人員
    await Promise.all([
      Tourist.deleteOne({ _id }).exec(),
      redisClient.del(`Tour:${info.tour_id._id}`), //刪快取
    ]);
    return res.send("您已成功刪除");
  } catch (e) {
    next(e);
  }
};
