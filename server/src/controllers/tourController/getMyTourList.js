const { Tour } = require("../../models");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = async (req, res, next) => {
  let { _id } = req.user;
  let { page, numberPerPage } = req.query;
  try {
    let foundTour = await Tour.aggregate([
      { $match: { author: new ObjectId(_id) } },
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
        $project: {
          num_of_participants: { $size: "$participants" },
          title: 1,
          description: 1,
          status: 1,
          totalDays: 1,
          limit: 1,
          updateDate: 1,
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
