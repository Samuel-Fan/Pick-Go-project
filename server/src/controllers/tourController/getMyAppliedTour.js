const { Tourist } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let { _id } = req.user;
  let { page, numberPerPage } = req.query;
  try {
    let foundTour = await Tourist.aggregate([
      { $match: { user_id: new ObjectId(_id), type: "參加者" } },
      {
        $lookup: {
          from: "tours",
          localField: "tour_id",
          foreignField: "_id",
          as: "tours",
        },
      },
      { $unwind: "$tours" },
      {
        $lookup: {
          from: "tourists",
          localField: "tour_id",
          foreignField: "tour_id",
          as: "participants",
          pipeline: [
            { $match: { $or: [{ type: "主辦者" }, { type: "參加者" }] } },
          ],
        },
      },
      {
        $project: {
          num_of_participants: { $size: "$participants" },
          title: "$tours.title",
          author: "$tours.author",
          description: "$tours.description",
          status: "$tours.status",
          totalDays: "$tours.totalDays",
          limit: "$tours.limit",
          updateDate: "$tours.updateDate",
          _id: "$tours._id",
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
                _id: 1,
                username: 1,
              },
            },
          ],
        },
      },
      { $skip: (page - 1) * numberPerPage },
      { $limit: Number(numberPerPage) },
      {
        $sort: {
          updateDate: -1,
        },
      },
    ]);
    return res.send(foundTour);
  } catch (e) {
    next(e);
  }
};
