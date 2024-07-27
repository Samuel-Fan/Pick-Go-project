const { Collection } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let user_id = req.user._id;
  let { page, numberPerPage } = req.query;
  try {
    let foundSite = await Collection.aggregate([
      { $match: { user_id: new ObjectId(user_id) } },
      {
        $lookup: {
          from: "sites",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      { $unwind: "$site" },
      {
        $lookup: {
          from: "likes",
          localField: "site_id",
          foreignField: "site_id",
          as: "like",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "site.author",
          foreignField: "_id",
          as: "site.author",
          pipeline: [
            {
              $project: { username: 1 },
            },
          ],
        },
      },
      { $unwind: "$site.author" },
      {
        $project: {
          num_of_like: { $size: "$like" },
          _id: "$site._id",
          title: "$site.title",
          country: "$site.country",
          region: "$site.region",
          type: "$site.type",
          content: "$site.content",
          photo: "$site.photo",
          updateDate: "$site.updateDate",
          author: "$site.author",
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
