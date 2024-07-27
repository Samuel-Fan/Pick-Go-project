const { Site } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res) => {
  let { _id } = req.params;
  try {
    let foundSite = await Site.aggregate([
      {
        $match: {
          _id: new ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "site_id",
          as: "like",
        },
      },
      {
        $lookup: {
          from: "collections",
          localField: "_id",
          foreignField: "site_id",
          as: "collection",
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
          num_of_like: { $size: "$like" },
          num_of_collection: { $size: "$collection" },
          title: 1,
          country: 1,
          region: 1,
          type: 1,
          content: 1,
          photo: 1,
          "author._id": 1,
          "author.username": 1,
          public: 1,
          updateDate: 1,
        },
      },
    ]);

    foundSite = foundSite[0];

    // 若沒找到資料
    if (!foundSite) {
      return res.status(404).send("無此資料");
    }

    return res.send(foundSite);
  } catch (e) {
    next(e);
  }
};
