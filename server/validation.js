const Joi = require("joi");

// 驗證註冊會員的資料
const registerValidation = (data) => {
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
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("password"))
      .messages({
        "any.required": "請填寫'確認密碼'",
        "any.only": "您輸入的兩個密碼並不相符，請再試一次",
      }),
    username: Joi.string(),
    gender: Joi.string().valid("男", "女", "其他").messages({
      "any.only": "性別必須為男、女、其他",
    }),
    age: Joi.number().integer().min(0).max(120).messages({
      "number.base": "年齡必須為數字",
      "number.integer": "年齡必須為整數",
      "number.min": "年齡須介於0-120歲",
      "number.max": "年齡須介於0-120歲",
    }),
    description: Joi.string(),
  });

  return Schema.validate(data);
};

module.exports = { registerValidation };
