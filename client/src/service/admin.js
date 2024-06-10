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
class AdminService {
  // 得到使用者資訊
  get_users(query, numberPerPage, page) {
    let { username, email } = query;
    return axios.get(
      apiURL +
        "/api/admin/users" +
        `?page=${page}&numberPerPage=${numberPerPage}&username=${username}&email=${email}`
    );
  }

  // 使用者數量(用來計算頁數用)
  get_users_count(query, numberPerPage, page) {
    let { username, email } = query;
    return axios.get(
      apiURL +
        "/api/admin/users/count" +
        `?&username=${username}&email=${email}`
    );
  }

  // 得到特定使用者資訊
  get_profile(user_id) {
    return axios.get(apiURL + "/api/admin/user/" + user_id);
  }

  // 取得景點簡易圖卡資料
  get_sites(query, numberPerPage, page, orderBy) {
    let { title, username, country, region, type } = query;
    return axios.get(
      apiURL +
        "/api/admin/sites" +
        `?page=${page}&numberPerPage=${numberPerPage}&title=${title}&username=${username}&country=${country}&region=${region}&type=${type}&orderBy=${orderBy}`
    );
  }

  // 取得景點的資料筆數(計算頁數)
  get_sites_count(query) {
    let { title, country, region, type, username } = query;
    return axios.get(
      apiURL +
        "/api/admin/sites/count" +
        `?title=${title}&username=${username}&country=${country}&region=${region}&type=${type}`
    );
  }

  // 查詢景點詳細資訊
  get_site_detail(site_id) {
    return axios.get(apiURL + "/api/admin/site/" + site_id);
  }

  // 取得旅程簡易表單資料
  get_tours(query, numberPerPage, page, status) {
    let { title, username } = query;
    return axios.get(
      apiURL +
        "/api/admin/tours" +
        `?page=${page}&numberPerPage=${numberPerPage}&title=${title}&username=${username}&status=${status}`
    );
  }

  get_tours_count(query, status) {
    // 取得公開景點的資料筆數
    let { title, username } = query;
    return axios.get(
      apiURL +
        "/api/admin/tours/count/" +
        `?title=${title}&username=${username}&status=${status}`
    );
  }

  // 查詢旅程詳細資訊
  get_tour_detail(tour_id) {
    return axios.get(apiURL + "/api/admin/tour/" + tour_id);
  }

  // 刪除使用者以及其景點、旅程與相關衍伸物
  delete_user(user_id) {
    return axios.delete(apiURL + "/api/admin/user/" + user_id);
  }

  // 刪除景點與相關衍伸物
  delete_site(site_id) {
    return axios.delete(apiURL + "/api/admin/site/" + site_id);
  }

  // 刪除旅程與相關衍伸物
  delete_tour(tour_id) {
    return axios.delete(apiURL + "/api/admin/tour/" + tour_id);
  }
}

let adminService = new AdminService();

export default adminService;
