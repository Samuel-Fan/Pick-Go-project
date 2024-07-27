const { Tour, TourSite } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res) => {
  let { _id } = req.params;
  try {
    // 旅程詳細資訊
    let query1 = () =>
      Tour.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "tourists",
            localField: "_id",
            foreignField: "tour_id",
            as: "participants",
            pipeline: [
              { $match: { $or: [{ type: "主辦者" }, { type: "參加者" }] } },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            num_of_participants: { $size: "$participants" },
            title: 1,
            description: 1,
            totalDays: 1,
            limit: 1,
            status: 1,
            updateDate: 1,
            "author._id": 1,
            "author.username": 1,
          },
        },
      ]);

    // 旅程每日景點資訊
    let query2 = () =>
      TourSite.aggregate([
        {
          $match: {
            tour_id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: "sites",
            localField: "site_id",
            foreignField: "_id",
            as: "site_info",
          },
        },
        { $unwind: { path: "$site_info", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            day: 1,
            site_id: 1,
            title: "$site_info.title",
            country: "$site_info.country",
            region: "$site_info.region",
            type: "$site_info.type",
          },
        },
        { $sort: { day: 1 } },
      ]);

    let [foundTour, dayPlan] = await Promise.all([query1(), query2()]);

    foundTour = foundTour[0];

    // 若沒找到資料
    if (!foundTour) {
      return res.status(404).send("無此資料");
    }

    return res.send({ foundTour, dayPlan });
  } catch (e) {
    next(e);
  }
};
