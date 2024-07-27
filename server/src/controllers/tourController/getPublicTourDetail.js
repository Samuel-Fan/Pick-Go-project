const { Tour, TourSite } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;
const redisClient = require("../../config/redis").redisClient_other;

module.exports = async (req, res, next) => {
  let { _id } = req.params;
  try {
    // 先搜尋快取中有無數據;
    let cacheData = await redisClient.get(`Tour:${_id}`);
    if (cacheData) {
      switch (cacheData) {
        case "404":
          return res.status(404).send("無此景點存在");
        case "403":
          return res.status(403).send("作者不公開相關頁面");
        default:
          return res.send(cacheData);
      }
    }

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
        { $unwind: "$author" },
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
      // 找不到資料也存進快取，防快取穿透 Cache Penetration
      await redisClient.set(`Tour:${_id}`, "404", {
        EX: 60 * 60 * 1,
      });
      return res.status(404).send("無此資料");
    }

    // 若旅程公開，則存入快取
    let randomTime = Math.floor(Math.random() * 31) + 30; // 使用隨機數，防快取雪崩 Cache Avalanche
    if (foundTour.status !== "不公開") {
      await redisClient.set(
        `Tour:${_id}`,
        JSON.stringify({ foundTour, dayPlan }),
        {
          EX: randomTime * 60 * 1,
        }
      );
    } else {
      // 若不公開，快取存入error 403
      await redisClient.set(`Tour:${_id}`, "403", {
        // 防快取穿透 Cache Penetration，其實期限可以設久一點
        EX: 60 * 60 * 1,
      });
      return res.status(403).send("作者不公開相關頁面");
    }

    return res.send({ foundTour, dayPlan });
  } catch (e) {
    next(e);
  }
};
