const Joi = require("joi");

// 驗證註冊會員的資料
const registerValidation = (data) => {
  const Schema = Joi.object({
    email: Joi.string().lowercase().required().email().messages({
      "any.required": "'Email'為必須填寫的項目",
      "string.empty": "'Email'為必須填寫的項目",
      "string.email": "請提供一個有效的'Email'",
    }),
    password: Joi.string().min(6).max(20).required().messages({
      "any.required": "'密碼'為必須填寫的項目",
      "string.empty": "'密碼'為必須填寫的項目",
      "string.min": "'密碼'長度最少為 6",
      "string.max": "'密碼'長度最長為 20",
    }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.required": "請填寫'確認密碼'",
        "any.only": "您輸入的兩個密碼並不相符，請再試一次",
      }),
    username: Joi.string().min(3).max(15).required().messages({
      "any.required": "'暱稱'為必須填寫的項目",
      "string.empty": "'暱稱'為必須填寫的項目",
      "string.min": "'暱稱'最少長度為 3 個字",
      "string.max": "'暱稱'最長長度為 15 個字",
    }),
  });

  return Schema.validate(data);
};

// 驗證登入資料
const loginValidation = (data) => {
  const Schema = Joi.object({
    email: Joi.string().lowercase().required().email().messages({
      "any.required": "'Email'為必須填寫的項目",
      "string.empty": "'Email'為必須填寫的項目",
      "string.email": "請提供一個有效的'Email'",
    }),
    password: Joi.string().min(6).required().messages({
      "any.required": "'密碼'為必須填寫的項目",
      "string.empty": "'密碼'為必須填寫的項目",
      "string.min": "'密碼'長度最少長度為 6",
    }),
  });

  return Schema.validate(data);
};

// 驗證會員修改資料(密碼以外)
const editBasicValidation = (data) => {
  const Schema = Joi.object({
    username: Joi.string().min(3).max(15).required().messages({
      "any.required": "'暱稱'為必須填寫的項目",
      "string.empty": "'暱稱'為必須填寫的項目",
      "string.min": "'暱稱'最少長度為 3 個字",
      "string.max": "'暱稱'最長長度為 15 個字",
    }),
    gender: Joi.string().valid("男", "女", "其他").messages({
      "any.only": "性別必須為男、女、其他",
    }),
    age: Joi.number().integer().min(0).max(120).messages({
      "number.base": "年齡必須為數字",
      "number.integer": "年齡必須為整數",
      "number.min": "年齡須介於0-120歲",
      "number.max": "年齡須介於0-120歲",
    }),
    description: Joi.string().allow(null, "").max(50).messages({
      "string.max": "'自我介紹'最長長度為 50 個字",
    }),
  });

  return Schema.validate(data);
};

// 驗證會員修改資料(密碼)
const editPasswordValidation = (data) => {
  const Schema = Joi.object({
    password: Joi.string().min(6).max(20).required().messages({
      "any.required": "'新密碼'為必須填寫的項目",
      "string.empty": "'新密碼'為必須填寫的項目",
      "string.min": "'新密碼'長度最少長度為 6",
      "string.max": "'密碼'長度最長長度為 20",
    }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.required": "請填寫'確認密碼'",
        "any.only": "您輸入的兩個密碼並不相符，請再試一次",
      }),
  });

  return Schema.validate(data);
};

// 驗證"景點"的資料格式
const sitesValidation = (data) => {
  const Schema = Joi.object({
    title: Joi.string().max(20).required().messages({
      "any.required": "'標題'為必須填寫的項目",
      "string.empty": "'標題'為必須填寫的項目",
      "string.max": "'標題'最長長度為 20 個字",
    }),
    country: Joi.string().required().valid("日本", "臺灣").messages({
      "any.only": "'國家'必須為日本或臺灣",
      "any.required": "'國家'為必須填寫的項目",
      "string.empty": "'國家'為必須填寫的項目",
    }),
    region: Joi.string().required().messages({
      "any.required": "'地區'為必須填寫的項目",
      "string.empty": "'地區'為必須填寫的項目",
    }),
    type: Joi.string()
      .valid("餐廳", "景點", "購物", "其他")
      .required()
      .messages({
        "any.only": "類別必須為餐廳、景點、購物或其他",
      }),
    content: Joi.string().max(300).required().allow(null, "").messages({
      "any.required": "'內容'為必須填寫的項目",
      "string.max": "'內容'最長長度為 300 個字",
    }),
  });

  return Schema.validate(data);
};

// 驗證"旅行"的資料格式
const toursValidation = (data) => {
  const Schema = Joi.object({
    title: Joi.string().max(20).required().messages({
      "any.required": "'標題'為必須填寫的項目",
      "string.empty": "'標題'為必須填寫的項目",
      "string.max": "'標題'最長長度為 20 個字",
    }),
    description: Joi.string().max(100).required().allow(null, "").messages({
      "any.required": "'簡介'為必須填寫的項目",
      "string.max": "'簡介'最長為 100字",
    }),
    status: Joi.string().valid("不公開", "純分享", "找旅伴").messages({
      "any.only": "類別必須為不公開、純分享、找旅伴",
    }),
    limit: Joi.number().max(10).min(1).required().messages({
      "any.required": "'人數限制'為必須填寫的項目",
      "number.base": "人數限制必須為數字",
      "number.integer": "人數限制必須為整數",
      "number.min": "人數限制須介於1-10人",
      "number.max": "人數限制須介於1-10人",
    }),
    totalDays: Joi.number().max(7).min(1).required().messages({
      "any.required": "'總天數'為必須填寫的項目",
      "number.base": "總天數必須為數字",
      "number.integer": "總天數限制必須為整數",
      "number.min": "總天數限制須介於1-7天",
      "number.max": "總天數限制須介於1-7天",
    }),
  });

  return Schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  editBasicValidation,
  editPasswordValidation,
  sitesValidation,
  toursValidation,
};
