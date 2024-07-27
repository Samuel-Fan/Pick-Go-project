const { Tour } = require("../../models");
const valid = require("../otherController/validation");
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  let { _id } = req.params;

  // 如旅程規格不符，則返回客製化錯誤訊息
  let { error } = valid.toursValidation(req.body); // req.body 含 title, description, status, limit, days
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    // 確認有無旅程存在
    let foundTour = await Tour.findOne({ _id }).lean().exec();
    if (!foundTour) {
      return res.status(404).send("找不到相關旅程");
    }

    // 只有該旅程作者才能編輯
    if (!foundTour.author.equals(req.user._id)) {
      return res.status(403).send("必須本人才能編輯");
    }

    let newData = Object.assign({}, req.body, { updateDate: Date.now() });

    await Promise.all([
      Tour.findOneAndUpdate({ _id }, newData, {
        // 更新資料
        runValidators: true,
      }),
      redisClient.del(`Tour:${_id}`), // 刪快取
    ]);

    return res.send("已修改");
  } catch (e) {
    next(e);
  }
};
