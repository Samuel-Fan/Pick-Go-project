const { Tourist } = require("../../models");

module.exports = async (req, res, next) => {
  let { tour_id } = req.query;
  try {
    // 自己於該旅程的參加狀態
    let myType = await Tourist.findOne({
      tour_id,
      user_id: req.user._id,
    })
      .select("type")
      .lean()
      .exec();

    // 若搜尋不到
    if (myType) {
      return res.send(myType);
    } else {
      return res.send({ type: "無" });
    }
  } catch (e) {
    next(e);
  }
};
