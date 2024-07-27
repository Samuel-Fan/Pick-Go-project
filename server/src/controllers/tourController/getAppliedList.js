const { Tourist } = require("../../models");

module.exports = async (req, res, next) => {
  let { tour_id } = req.params;
  try {
    // 找尋相關旅程及相關參與人員
    let tourists = await Tourist.find({ tour_id })
      .populate("user_id", ["username"])
      .lean()
      .exec();

    // 找不到相關資訊
    if (tourists.length === 0) {
      return res.status(404).send("找不到相關資訊");
    }

    let checkAuth = tourists.filter(
      (tourist) =>
        tourist.user_id._id.equals(req.user._id) &&
        (tourist.type === "主辦者" || tourist.type === "參加者")
    );

    // 若非主辦者或參加者操作
    if (checkAuth.length === 0) {
      return res.status(403).send("只有主辦者或參加者才能取得資訊");
    }

    return res.send(tourists);
  } catch (e) {
    next(e);
  }
};
