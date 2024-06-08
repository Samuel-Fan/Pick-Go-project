import React from "react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../../../service/auth";

// 使用者資料總覽

const MyProfile = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  // 客製化日期
  const timeConvert = (date) => {
    date = new Date(date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 取得使用者詳細資料
    authService
      .get_auth_user()
      .then((data) => {
        let user = data.data;
        setCurrentUser(user);
      })
      .catch((e) => {
        localStorage.removeItem("auth");
        navigate("/login");
        navigate(0);
      });
  }, [navigate, setCurrentUser]);

  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        <h2 className="me-4 my-2">個人資料頁面</h2>
        <a href="/users/edit">
          <button
            type="button"
            className="mybtn me-4"
            data-mdb-ripple-init
            style={{ marginTop: "0.8rem" }}
          >
            編輯個人檔案
          </button>
        </a>
        <Link to="/users/editPassword">
          <button
            type="button"
            className="mybtn"
            data-mdb-ripple-init
            style={{ marginTop: "0.8rem" }}
          >
            變更密碼
          </button>
        </Link>
      </div>
      <hr />
      <table className="table" style={{ marginBottom: "0" }}>
        <thead>
          <tr>
            <th scope="col">Email</th>
            <th scope="col"></th>
            <th scope="col">{currentUser && currentUser.email}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">暱稱</th>
            <td></td>
            <td>{currentUser && currentUser.username}</td>
          </tr>
          <tr>
            <th scope="row">性別</th>
            <td></td>
            <td>{currentUser && currentUser.gender}</td>
          </tr>
          <tr>
            <th scope="row">年齡</th>
            <td></td>
            <td>{currentUser && currentUser.age}</td>
          </tr>
          <tr>
            <th scope="row">帳號創建於</th>
            <td></td>
            <td>{currentUser && timeConvert(currentUser.createdDate)}</td>
          </tr>
          <tr>
            <th scope="row">Email認證</th>
            <td></td>
            <td>
              {currentUser &&
                (currentUser.email_verified ? "以認證" : "尚未認證")}
            </td>
          </tr>
          <tr style={{ borderBottom: "white" }}>
            <th scope="row">自我簡介</th>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <div>
        <div style={{ margin: "0.5rem", whiteSpace: "pre-line" }}>
          {currentUser && currentUser.description}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
