const mongoose = require("mongoose");
const { Schema } = mongoose;

const touristSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" }, // User 的 primary key
  tour_id: { type: Schema.Types.ObjectId, ref: "Tour", index: true }, // Tour 的 primary key
  type: { type: String, enum: ["主辦者", "申請者", "參加者"] },
});

module.exports = mongoose.model("Tourist", touristSchema);
