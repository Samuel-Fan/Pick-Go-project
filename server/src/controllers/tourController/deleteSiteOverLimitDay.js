const { Tour, TourSite } = require("../../models");

module.exports = async (req, res, next) => {
  let tour_id = req.params._id; // 某個旅程
  let day = Number(req.params.day); // 總天數
  try {
    let foundSite = await Tour.findOne({ _id: tour_id })
      .select("author")
      .lean()
      .exec();

    // 若找不到景點，返回錯誤
    if (!foundSite) {
      return res.status(404).send("找不到相關行程");
    }

    // 天數沒給
    if (!day) {
      return res.status(400).send("必須給'天數'的參數才能刪除");
    }

    // 非本人編輯，返回錯誤
    if (!foundSite.author.equals(req.user._id)) {
      return res.status(403).send("只有主辦人才能編輯");
    }

    // 刪除行程
    await TourSite.deleteMany({ tour_id, day: { $gt: day } });
    return res.send("成功刪除");
  } catch (e) {
    next(e);
  }
};
