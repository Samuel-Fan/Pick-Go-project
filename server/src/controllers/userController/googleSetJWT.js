const jwt = require("jsonwebtoken");

module.exports = async (req, res) => {
  if (!req.user) {
    return res.status(400).send("無使用者登入");
  }

  const tokenObject = { _id: req.user._id, email: req.user.email };
  const token = jwt.sign(
    tokenObject,
    process.env.JWT_SECRET || "happycodingjwtyeah!",
    {
      expiresIn: "4h",
    }
  );

  const user = req.user;

  req.logOut((err) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.send({ user, jwtToken: "JWT " + token });
    }
  });
};
