const mongoose = require("mongoose");
const { Schema } = mongoose;

// 處理用戶對景點按讚、收藏等行為

const actionSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" }, // User 的 primary key
  site_id: { type: Schema.Types.ObjectId, ref: "Site" }, // Site 的 primary key
  action: { type: String, enum: ["讚", "收藏"] },
});

module.exports = mongoose.model("Action", actionSchema);
