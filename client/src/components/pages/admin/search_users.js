import React from "react";
import { useEffect, useState } from "react";
import adminService from "../../../service/admin";
import { useNavigate } from "react-router-dom";
import PageChoose from "../../btn/pageChoose";
import Profile from "./profile";
import Delete from "../../modal/delete";

// 搜尋公開的景點

const SearchUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState();
  const [count, setCount] = useState(); // 計算有幾個users 分頁用
  const [page, setPage] = useState(1);
  const [user_id, setUser_id] = useState();
  const numberPerPage = 20; //每頁顯示幾個

  const [deleteId, setDeleteId] = useState(); // 設定即將要刪除的目標
  const deleteFunction = adminService.delete_user;

  const [message, setMessage] = useState(""); // 錯誤訊息

  const [query, setQuery] = useState({
    username: "",
    email: "",
  });

  // 搜尋
  const handleSearch = async (e) => {
    e.preventDefault();
    let form = new FormData(e.currentTarget);
    let data = Object.fromEntries(form.entries());
    setQuery(
      // 簡單搜尋 只有title
      Object.assign({}, query, data)
    );
    setPage(1);
  };

  // 處理刪除使用者
  const handleDelete = (e) => {
    setDeleteId(e.target.name);
    document.querySelector("#siteDeleteConfirm").style.display = "flex";
    document.querySelector("#gray_cover").style.display = "block";
  };

  // 剛進網站時，讀取user總數以設定分頁格式
  useEffect(() => {
    adminService
      .get_users_count(query)
      .then((data) => {
        if (data.data.count === 0) {
          setCount("無");
        } else {
          setCount(Math.ceil(data.data.count / numberPerPage));
        }
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              navigate("/login");
              break;
            case 403:
              navigate("/noAuth");
              break;
            default:
              alert(e.response.data);
              break;
          }
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [numberPerPage, query, navigate]);

  // 每次切換頁面讀取一次
  useEffect(() => {
    adminService
      .get_users(query, numberPerPage, page)
      .then((data) => {
        let result = data.data;
        setUsers(result);
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              navigate("/login");
              break;
            case 403:
              navigate("/noAuth");
              break;
            default:
              alert(e.response.data);
              break;
          }
        } else {
          alert("伺服器發生問題");
        }
      });
  }, [page, numberPerPage, query, navigate]);

  return (
    <div className="d-flex flex-column align-items-center my-3 mx-5">
      <div className="d-flex align-items-center">
        {/* 搜尋介面 */}
        <form className="my-2" onSubmit={handleSearch}>
          <div className="input-group">
            <div className="form-outline">
              <input
                type="search"
                id="search-user-by-username"
                className="form-control"
                placeholder="以關鍵字搜尋標題"
                name="username"
              />
            </div>
            <div className="form-outline">
              <input
                type="search"
                id="search-user-by-email"
                className="form-control"
                placeholder="信箱搜尋"
                name="email"
              />
            </div>
            <button className="btn btn-primary" style={{ zIndex: 0 }}>
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
      </div>

      <div className="mx-4">
        <hr
          className="mx-4"
          style={{ border: "2px solid rgb(90, 178, 255)", opacity: "1" }}
        />
        {/* 頁數選擇 */}
        <div className="d-flex flex-wrap container ms-3">
          <PageChoose page={page} setPage={setPage} count={count} />
        </div>
      </div>
      <div>
        <table className="table align-middle">
          <thead>
            <tr>
              <td>暱稱</td>
              <td>email</td>
              <td>介紹</td>
              <td>檢視</td>
            </tr>
          </thead>
          <tbody>
            {users
              ? users.map((user) => (
                  <tr>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td style={{ whiteSpace: "pre-line" }}>
                      {user.description}
                    </td>
                    <td>
                      <button
                        className="btn bg-primary-subtle my-2"
                        onClick={() => {
                          setUser_id(user._id);
                        }}
                      >
                        檢視
                      </button>
                      <button
                        className="btn bg-danger-subtle"
                        name={user._id}
                        onClick={handleDelete}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {/* 查看profile */}
      {user_id && <Profile user_id={user_id} setUser_id={setUser_id} />}

      {/* // 錯誤訊息 */}
      <div className="small mb-2 pb-lg-2">
        {message && (
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        )}
      </div>

      {/* // 刪除旅程功能 */}
      <Delete
        deleteFunction={deleteFunction}
        deleteId={deleteId}
        setDeleteId={setDeleteId}
        setMessage={setMessage}
      />
    </div>
  );
};

export default SearchUsers;
