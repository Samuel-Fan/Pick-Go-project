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
      "string.min": "'密碼'長度最少長度為 6",
      "string.max": "'密碼'長度最長長度為 20",
    }),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.required": "請填寫'確認密碼'",
        "any.only": "您輸入的兩個密碼並不相符，請再試一次",
      }),
    username: Joi.string().min(3).max(20).required().messages({
      "any.required": "'暱稱'為必須填寫的項目",
      "string.empty": "'暱稱'為必須填寫的項目",
      "string.min": "'暱稱'最少長度為 3 個字",
      "string.max": "'暱稱'最長長度為 20 個字",
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
    description: Joi.string().allow(null, ""),
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
    username: Joi.string().min(3).max(20).required().messages({
      "any.required": "'暱稱'為必須填寫的項目",
      "string.empty": "'暱稱'為必須填寫的項目",
      "string.min": "'暱稱'最少長度為 3 個字",
      "string.max": "'暱稱'最長長度為 20 個字",
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
    description: Joi.string().allow(null, ""),
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
    content: Joi.string().required().allow(null, ""),
  });

  return Schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  editBasicValidation,
  editPasswordValidation,
  sitesValidation,
};
