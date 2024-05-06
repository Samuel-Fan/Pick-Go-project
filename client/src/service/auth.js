import axios from "axios";
axios.defaults.withCredentials = true;

const apiURL =
  "https://8080-samuelfan-pickgoproject-063jy55okjc.ws-us110.gitpod.io";

class AuthService {
  // 登入系統
  async post_login(username, password) {
    return await axios.post(apiURL + "/api/users/login", {
      username,
      password,
    });
  }

  async get_auth_test() {
    return await axios.get(apiURL + "/api/users/test");
  }
}

export default new AuthService();
