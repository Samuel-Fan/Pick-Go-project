const { Site } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let { _id } = req.user;
  let { page, numberPerPage } = req.query;
  try {
    let foundSite = await Site.aggregate([
      { $match: { author: new ObjectId(_id) } },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "site_id",
          as: "likes",
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
              $project: {
                username: 1,
              },
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
          content: 1,
          public: 1,
          photo: 1,
          updateDate: 1,
          "author._id": 1,
          "author.username": 1,
          num_of_like: { $size: "$likes" },
        },
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
    ]);

    return res.send(foundSite);
  } catch (e) {
    next(e);
  }
};
