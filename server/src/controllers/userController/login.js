const User = require("../../models").User;
const jwt = require("jsonwebtoken");
const valid = require("../otherController/validation");
const bcrypt = require("bcrypt");

module.exports = async (req, res, next) => {
  // 先驗證資料格式
  let { error } = valid.loginValidation(req.body); //req.body 中應有 email, password
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let { email, password } = req.body;
  try {
    // 用email找尋使用者
    const foundUser = await User.findOne({ email })
      .select(["password", "username"])
      .lean()
      .exec();
    if (!foundUser) {
      return res.status(400).send("此email無人註冊過");
    }

    // 驗證密碼
    let result = bcrypt.compare(password, foundUser.password);
    if (!result) {
      return res.status(400).send("帳號或密碼錯誤");
    }

    // 回傳 JWT
    const tokenObject = { _id: foundUser._id };
    const token = jwt.sign(
      tokenObject,
      process.env.JWT_SECRET || "happycodingjwtyeah!",
      {
        expiresIn: "4h",
      }
    );
    return res.send({ user: foundUser, jwtToken: "JWT " + token });
  } catch (e) {
    next(e);
  }
};
