const { Tour, TourSite } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  let { _id } = req.params;

  try {
    // 先確認快取有無存為404 error
    let cacheData = await redisClient.get(`Tour:${_id}`);
    if (cacheData === "404") {
      return res.status(404).send("錯誤");
    }

    // 搜尋資料庫
    // 旅程文字資料
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
        { $unwind: "$author" },
        {
          $project: {
            num_of_participants: { $size: "$participants" },
            participants: 1,
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

    // 旅程景點資料
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

    // 景點不對主辦者或參加者以外的人開放
    let checkAuth = foundTour.participants.filter((tourist) => {
      return tourist.user_id.equals(req.user._id);
    });
    if (checkAuth.length === 0) {
      return res.status(403).send("您無查看權限");
    }

    // 若景點公開，則存入快取
    let randomTime = Math.floor(Math.random() * 31) + 30; // 使用隨機數，防快取雪崩 Cache Avalanche
    if (foundTour.status !== "不公開") {
      await redisClient.set(
        `Tour:${_id}`,
        JSON.stringify({ foundTour, dayPlan }),
        {
          EX: randomTime * 60 * 1,
        }
      );
    }

    return res.send({ foundTour, dayPlan });
  } catch (e) {
    next(e);
  }
};
