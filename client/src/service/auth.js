import axios from "axios";
axios.defaults.withCredentials = true;

const apiURL =
  "https://8080-samuelfan-pickgoproject-063jy55okjc.ws-us110.gitpod.io";

// 負責使用者相關與server的互動
class AuthService {
  // 登入系統
  post_login(username, password) {
    return axios.post(apiURL + "/api/users/login", {
      username,
      password,
    });
  }

  // 登出系統

  get_logout() {
    return axios.get(apiURL + "/api/users/logout");
  }

  // 得到使用者資訊
  get_auth_user() {
    return axios.get(apiURL + "/api/users");
  }

  // 註冊系統
  post_signup(data) {
    return axios.post(apiURL + "/api/users/register", data);
  }

  // 更改用戶資料
  patch_modify(data) {
    return axios.patch(apiURL + "/api/users/modify/basic/", data);
  }

  get_auth_test() {
    return axios.get(apiURL + "/api/users/test");
  }
}

export default new AuthService();
