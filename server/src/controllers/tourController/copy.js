const { Tour, TourSite, Tourist } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let { tour_id } = req.params;
  let user_id = req.user._id;
  try {
    // 每人限建立5個旅程
    let count = await Tour.find({ author: new ObjectId(user_id) })
      .count()
      .exec();

    if (count >= 5) {
      return res.status(400).send("每人只能建立5個旅程!(目前)");
    }

    let foundTour = await Tour.findOne({ _id: tour_id }).lean().exec();
    let foundSites = await TourSite.find({ tour_id })
      .select(["site_id", "day"])
      .lean()
      .exec();

    // 若無搜尋到旅程
    if (!foundTour) {
      return res.status(404).send("無找到相關旅程");
    }

    let { title, description, totalDays } = foundTour;

    let newTour = new Tour({
      title,
      description,
      totalDays,
      author: user_id,
    });

    let tourist = new Tourist({
      tour_id: newTour._id,
      user_id,
      type: "主辦者",
    });

    let site_arr = foundSites.map((site) => {
      return { tour_id: newTour._id, site_id: site.site_id, day: site.day };
    });

    await Promise.all([
      newTour.save(),
      tourist.save(),
      TourSite.insertMany(site_arr),
    ]);

    return res.status(201).send("成功複製");
  } catch (e) {
    next(e);
  }
};
