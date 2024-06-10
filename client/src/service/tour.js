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

// 負責"景點"相關與server的互動
class TourService {
  // 取得公開的景點資料

  get_search_tours(query, numberPerPage, page, status) {
    // 取得旅程簡易表單資料
    let { title, username } = query;
    return axios.get(
      apiURL +
        "/api/tours/search/" +
        `?page=${page}&numberPerPage=${numberPerPage}&title=${title}&username=${username}&status=${status}`
    );
  }

  get_tours_count(query, status) {
    // 取得公開景點的資料筆數
    let { title, username } = query;
    return axios.get(
      apiURL +
        "/api/tours/count/" +
        `?title=${title}&username=${username}&status=${status}`
    );
  }

  // 取得使用者自己建立的景點資訊
  get_myTour_count() {
    // 用來計算幾頁
    return axios.get(apiURL + "/api/tours/myTour/count");
  }

  get_myTour(page, numberPerPage) {
    // 取得資訊
    return axios.get(
      apiURL +
        "/api/tours/myTour" +
        `?page=${page}&numberPerPage=${numberPerPage}`
    );
  }

  // 查詢旅程詳細資訊(公開版)
  get_tour_detail(tour_id) {
    return axios.get(apiURL + "/api/tours/detail/" + tour_id);
  }

  // 確認自己於某旅程的參加狀態
  get_myType(tour_id) {
    return axios.get(apiURL + `/api/tours/myType?tour_id=${tour_id}`);
  }

  // 查詢旅程詳細資訊(私人)
  get_myTour_detail(tour_id) {
    return axios.get(apiURL + "/api/tours/myTour/detail/" + tour_id);
  }

  // 查詢旅程參加人員
  get_myTour_tourist(tour_id) {
    return axios.get(apiURL + `/api/tours/${tour_id}/tourist`);
  }

  // 查詢自己參加的旅程
  get_myApplied(page, numberPerPage) {
    return axios.get(
      apiURL +
        `/api/tours/myApplied` +
        `?page=${page}&numberPerPage=${numberPerPage}`
    );
  }

  // 建立新景點
  post_new_tour(data) {
    return axios.post(apiURL + "/api/tours/new", data);
  }

  // 匯入景點
  post_addSite(tour_id, data) {
    return axios.post(apiURL + "/api/tours/" + tour_id + "/addSites", data);
  }

  // 申請成為旅伴
  post_apply(tour_id) {
    return axios.post(apiURL + "/api/tours/apply/" + tour_id);
  }

  // 複製旅程
  post_copy(tour_id) {
    return axios.post(apiURL + "/api/tours/copy/" + tour_id);
  }

  // 編輯景點
  patch_edit_tour(_id, data) {
    return axios.patch(apiURL + "/api/tours/modify/" + _id, data);
  }

  // 將申請者更新成參加者
  patch_add_to_participant(tourist_id) {
    return axios.patch(apiURL + "/api/tours/add_participant/" + tourist_id);
  }

  // 編輯景點減少總天數時，刪除超出的景點
  delete_over_totalDays(_id, day) {
    return axios.delete(apiURL + `/api/tours/over_totalDays/${_id}/${day}`);
  }

  // 刪除旅程
  delete_tour(_id) {
    return axios.delete(apiURL + "/api/tours/" + _id);
  }

  // 刪除特定旅程中的景點
  delete_tour_someSite(_id) {
    return axios.delete(apiURL + "/api/tours/tourSite/" + _id);
  }

  // 刪除參加旅程的申請者or參加者
  delete_tourist(tourist_id) {
    return axios.delete(apiURL + "/api/tours/tourist/" + tourist_id);
  }
}
let tourService = new TourService();

export default tourService;
