import axios from "axios";

const apiURL = process.env.REACT_APP_API_URL;

// 設定token
let token;
if (localStorage.getItem("auth")) {
  token = JSON.parse(localStorage.getItem("auth")).jwtToken;
} else {
  token = "";
}

axios.defaults.headers.common["Authorization"] = token;

// 負責使用者相關與server的互動
class AuthService {
  // 得到使用者資訊-local
  get_auth_user() {
    return axios.get(apiURL + "/api/users");
  }

  // 得到特定使用者資訊
  get_profile(user_id) {
    return axios.get(apiURL + "/api/users/profile/" + user_id);
  }

  // google登入取得jwt
  get_google_jwt() {
    return axios.get(apiURL + "/api/users/auth/google/setJwt", {
      withCredentials: true,
    });
  }

  // 登入系統
  post_login(data) {
    return axios.post(apiURL + "/api/users/login", data);
  }

  // 註冊系統
  post_signup(data) {
    return axios.post(apiURL + "/api/users/register", data);
  }

  // 更改用戶資料
  patch_modify(data) {
    return axios.patch(apiURL + "/api/users/basic", data);
  }

  // 更改用戶密碼
  patch_modify_password(data) {
    return axios.patch(apiURL + "/api/users/password", data);
  }

  get_auth_test() {
    return axios.get(apiURL + "/api/users/test");
  }
}

let authService = new AuthService();

export default authService;
