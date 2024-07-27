const { Site } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let { author_id, site_id } = req.query;

  try {
    let foundSite = await Site.aggregate([
      {
        $match: {
          author: new ObjectId(author_id),
          _id: { $ne: new ObjectId(site_id) },
          public: true,
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
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [
            {
              $project: { username: 1 },
            },
          ],
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          title: 1,
          country: 1,
          region: 1,
          type: 1,
          content: 1,
          photo: 1,
          updateDate: 1,
          author: 1,
          num_of_like: { $size: "$like" },
        },
      },
      { $sample: { size: 3 } },
    ]);

    return res.send(foundSite);
  } catch (e) {
    next(e);
  }
};
