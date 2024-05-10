const router = require("express").Router();
const Site = require("../models/index").site;
const valid = require("../validation");

router.get("/", async (req, res) => {
  try {
    let foundData = await Site.find().exec();
    console.log(foundData);
    return res.send(foundData);
  } catch (e) {
    res.status(500).send("伺服器發生問題");
  }
});

router.post("/", async (req, res) => {
  // 驗證填入資料的正確性，如果不合規範則 return 錯誤
  let { error } = valid.sitesValidation(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message);
  }
  try {
    let { photoBinData } = req.body;
    let site = new Site({ photoBinData });
    let result = await site.save();
    return res.send(result);
  } catch (e) {
    res.status(500).send("伺服器發生問題");
  }
});

module.exports = router;
