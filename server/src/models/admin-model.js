const mongoose = require("mongoose");
const { Schema } = mongoose;

// 後台人員
const adminSchema = new Schema({
  admin_id: { type: Schema.Types.ObjectId, ref: "User", index: true }, // User 的 primary key
});

module.exports = mongoose.model("Admin", adminSchema);
