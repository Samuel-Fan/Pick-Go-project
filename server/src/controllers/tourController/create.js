const { Tour, Tourist } = require("../../models");
const valid = require("../otherController/validation");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  try {
    // 每人限建立5個旅程
    let count = await Tour.find({
      author: new ObjectId(req.user._id),
    }).count();
    if (count >= 5) {
      return res.status(400).send("每人只能建立5個旅程!(目前)");
    }

    // 如旅程規格不符，則返回客製化錯誤訊息
    let { error } = valid.toursValidation(req.body); // req.body 含 title, description, status, limit, totalDays
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    let { title, description, status, limit, totalDays } = req.body;
    let tour = new Tour({
      title,
      description,
      status,
      limit,
      totalDays,
      author: req.user._id,
    });

    // 創立旅程時，同時將自己設為主辦者
    let tour_id = tour._id;
    let tourist = new Tourist({
      user_id: req.user._id,
      tour_id,
      type: "主辦者",
    });

    await Promise.all([tour.save(), tourist.save()]);
    return res.status(201).send("資料儲存完畢");
  } catch (e) {
    next(e);
  }
};
