const redisClient = require("../config/redis").redisClient_user;
const mutex = require("./lock");

// 單一IP限流
class IPLimiter {
  constructor(maxLimit, interval) {
    this.maxLimit = maxLimit;
    this.interval = interval;
    this.banList = {};
  }

  limiter = (req, res, next) => {
    if (this.banList[req.ip]) {
      // 確認 ban 的時間是否過10分鐘
      console.log(Date.now() - this.banList[req.ip]);
      if (Date.now() - this.banList[req.ip] > 60 * 1000) {
        delete this.banList[req.ip];
        next();
      } else {
        return res.status(429).send("Too many requests");
      }
    } else {
      this.count(req.ip);
      next();
    }
  };

  count = async (ip) => {
    // 為避免 race condition，先用 mutex 鎖住
    let unlock = await mutex.locked();
    let record = await redisClient.get(`IP:${ip}`);
    // 若有紀錄，則增加計數
    if (record) {
      record = 1 + Number(record);
      await redisClient.set(`IP:${ip}`, record, {
        EX: 1 * 60 * 1,
      });
      this.checkLimit(ip, record);
    } else {
      // 若無紀錄，開始計算，計時1分後刪掉
      redisClient.set(`IP:${ip}`, 0, {
        EX: 1 * 60 * 1,
      });
      this.setClear(ip);
    }
    unlock();
  };

  checkLimit = (ip, record) => {
    if (record >= this.maxLimit) {
      this.banList[ip] = Date.now();
      console.log("ip:" + ip + "因流量過高遭到鎖定, ban 1分鐘");
    }
  };

  setClear = (ip) => {
    setTimeout(() => {
      redisClient.del(`IP:${ip}`);
    }, this.interval);
  };
}

// 總限流設定
class RateLimiter {
  constructor(maxTokens, refillRate, interval) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.interval = interval;
  }

  // 每分鐘總限流
  tokenBucket = (req, res, next) => {
    if (this.tokens > 0) {
      this.tokens -= 1;
      next();
    } else {
      return res.status(429).send("Too many requests");
    }
  };

  refill = () => {
    setInterval(() => {
      if (this.tokens < this.maxTokens) {
        this.tokens += this.refillRate;
      } else {
        this.tokens = this.maxTokens;
      }
    }, this.interval);
  };
}

const singleIPLimiter = new IPLimiter(100, 1 * 60 * 1000); // 單IP每分鐘限100次
const totalRateLimiter = new RateLimiter(5000, 100, 1 * 60 * 1000);

module.exports = { singleIPLimiter, totalRateLimiter };
