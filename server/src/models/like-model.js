const mongoose = require("mongoose");
const { Schema } = mongoose;

// 處理用戶對景點按讚

const likeSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" }, // User 的 primary key
  site_id: { type: Schema.Types.ObjectId, ref: "Site" }, // Site 的 primary key
});

module.exports = mongoose.model("Like", likeSchema);
