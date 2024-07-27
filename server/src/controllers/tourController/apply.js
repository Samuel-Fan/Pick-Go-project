const { Tour, Tourist } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  try {
    let { tour_id } = req.params;

    // 找尋相關旅程
    let foundTour = await Tour.findOne({ _id: tour_id })
      .select(["status", "limit"])
      .lean()
      .exec();

    // 若找不到相關旅程
    if (!foundTour) {
      return res.status(404).send("找不到相關旅程");
    }

    // 若旅程並非找尋旅伴中
    if (foundTour.status !== "找旅伴") {
      return res.status(403).send("目前無開放申請");
    }

    // 確認是否已申請過
    let check = await Tourist.findOne({ tour_id, user_id: req.user._id })
      .select("user_id")
      .lean()
      .exec();

    if (check) {
      return res.status(400).send("您已申請過 or 已參加");
    }

    // 確認人數是否已達上限
    let count = await Tourist.find({
      tour_id: new ObjectId(tour_id),
      type: { $ne: "申請者" },
    })
      .count()
      .exec();

    if (count >= foundTour.limit) {
      return res.status(403).send("人數已達上限");
    }

    // 若以上都沒問題，則設定為申請者
    let tourist = new Tourist({
      tour_id,
      user_id: req.user._id,
      type: "申請者",
    });

    await Promise.all([tourist.save(), redisClient.del(`Tour:${tour_id}`)]); // 刪快取
    return res.status(201).send("您已成功發出申請");
  } catch (e) {
    next(e);
  }
};
