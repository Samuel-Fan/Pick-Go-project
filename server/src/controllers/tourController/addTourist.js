const { Tourist } = require("../../models");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  try {
    let { _id } = req.params; // tourist_id

    // 確認有無該申請者
    let applicant = await Tourist.findOne({ _id })
      .populate("tour_id", ["author", "limit"])
      .exec();

    // 確認有無該申請者
    if (!applicant) {
      return res.status(404).send("無找到相關申請者");
    }

    // 若找不到相關旅程
    if (!applicant.tour_id) {
      return res.status(404).send("找不到相關旅程");
    }

    // 若非作者本人操作
    if (!applicant.tour_id.author.equals(req.user._id)) {
      return res.status(403).send("只有作者才能操作");
    }

    // 確認是否已參加
    if (applicant.type === "主辦者" || applicant.type === "參加者") {
      return res.status(400).send("此人已參加旅行團");
    }

    // 確認人數是否已達上限
    let count = await Tourist.find({
      tour_id: applicant.tour_id._id,
      type: { $ne: "申請者" },
    })
      .count()
      .lean()
      .exec();

    if (count >= applicant.tour_id.limit) {
      return res.status(403).send("人數已達上限");
    }

    // 若以上都沒問題，則設定為參加者
    applicant.type = "參加者";

    await Promise.all([
      applicant.save(),
      redisClient.del(`Tour:${applicant.tour_id._id}`), // 刪快取
    ]);
    return res.send("已成功加入該成員");
  } catch (e) {
    next(e);
  }
};
