const mongoose = require("mongoose");
const { Schema } = mongoose;

const tourSchema = new Schema({
  title: { type: String },
  description: { type: String, maxLength: 500 },
  author: { type: Schema.Types.ObjectId, ref: "User", index: true }, // User 的 primary key
  limit: { type: Number, default: 1 }, // 限制參加人數
  totalDays: { type: Number, default: 1 }, // 旅行有幾天
  status: {
    type: String,
    default: "不公開",
    enum: ["不公開", "純分享", "找旅伴"],
  }, // 不公開、純分享、找旅伴 3種
  createdDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tour", tourSchema);
