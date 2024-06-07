import React from "react";
import { useEffect, useState } from "react";
import tourService from "../../service/tour";
import { useNavigate } from "react-router-dom";
import PageChooseComponent from "../smallComponents/pageChoose-component";
import ProfileComponent from "../smallComponents/profile-component";
import TourTableComponent from "../smallComponents/tourTable-component";

const SearchToursComponent = () => {
  const navigate = useNavigate();

  const [tours, setTours] = useState();
  const [count, setCount] = useState(); // 計算有幾個sites 分頁用
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(false); // 只搜尋'找旅伴'的旅程?
  const [user_id, setUser_id] = useState("");
  const numberPerPage = 8; //每頁顯示幾個

  const [query, setQuery] = useState({
    title: "",
    username: "",
  });

  // 搜尋
  const handleSearch = async (e) => {
    e.preventDefault();
    let form = new FormData(e.currentTarget);
    let data = Object.fromEntries(form.entries()); // title 及 username
    setQuery(Object.assign({}, query, data));
    setPage(1);
  };

  //   剛進網站時，讀取site總數以設定分頁格式
  useEffect(() => {
    tourService
      .get_tours_count(query, status)
      .then((data) => {
        console.log(data.data.count);
        if (data.data.count === 0) {
          setCount("無");
        } else {
          setCount(Math.ceil(data.data.count / numberPerPage));
        }
      })
      .catch((e) => {
        if (e.response) {
          alert(e.response.data);
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [status, numberPerPage, query, navigate]);

  // 每次切換頁面讀取一次
  useEffect(() => {
    console.log(query);
    tourService
      .get_search_tours(query, numberPerPage, page, status)
      .then((data) => {
        let result = data.data;
        console.log(result);
        setTours(result);
      })
      .catch((e) => {
        if (e.response) {
          alert(e.response.data);
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [status, page, numberPerPage, query, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center my-3">
      <div className="d-flex align-items-center">
        {/* 搜尋介面 */}
        <form className="border p-2" onSubmit={handleSearch}>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              style={{ width: "300px" }}
              name="title"
              placeholder="以關鍵字搜尋標題"
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              style={{ width: "300px" }}
              name="username"
              placeholder="作者暱稱"
            />
          </div>
          <div className="d-flex justify-content-center">
            <button id="add-new-site-button" className="btn btn-primary">
              搜尋<i className="fas fa-search ms-2"></i>
            </button>
          </div>
        </form>
      </div>
      <div style={{ width: "100%" }}>
        <hr
          className="mx-4"
          style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
        />
        {/* 頁數選擇 */}
        <div className="d-flex flex-wrap container ms-3">
          <PageChooseComponent page={page} setPage={setPage} count={count} />
          <div className="mt-2">
            <div className="form-check form-check-inline me-4 ">
              <input
                className="form-check-input"
                type="checkbox"
                name="sort"
                id="sort_by_date"
                onClick={() => {
                  setStatus(!status);
                }}
              />
              <label className="form-check-label" htmlFor="sort_by_date">
                只搜尋正在搜尋旅伴的旅行
              </label>
            </div>
          </div>
          <div className="mt-2 ms-5">
            備註： 編輯旅程後要
            <span style={{ color: "red", fontWeight: "bold" }}>1</span>
            分鐘才會同步於此搜尋頁面
          </div>
        </div>
      </div>

      {/* 旅程列表 */}
      <div style={{ width: "97%" }}>
        <TourTableComponent tours={tours} setUser_id={setUser_id} tourPublic={true} />
      </div>
      {/* // 查看profile */}
      {user_id && (
        <ProfileComponent user_id={user_id} setUser_id={setUser_id} />
      )}
    </div>
  );
};

export default SearchToursComponent;
