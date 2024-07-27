module.exports = (err, req, res, next) => {
  console.log(err);
  return res.status(500).send("伺服器發生問題");
};
