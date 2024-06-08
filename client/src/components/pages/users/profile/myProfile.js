import React from "react";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../../../service/auth";

// 使用者資料總覽

const MyProfile = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  // 客製化日期
  const timeConvert = (string) => {
    return string.match(/\d+-\d+-\d+/);
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
      {currentUser && (
        <div>
          <div className="d-flex flex-wrap justify-content-center border">
            {currentUser.photo.url && (
              <div className="me-4 border" style={{ flex: "0 1 250px" }}>
                <img
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  src={currentUser.photo.url}
                  alt={currentUser.photo.photoName}
                />
              </div>
            )}
            <table
              className="table fw-bold align-middle"
              style={{
                flex: "1 1 300px",
                margin: "0",
              }}
            >
              <tbody>
                <tr>
                  <th>Email</th>
                  <th></th>
                  <th>{currentUser.email}</th>
                </tr>
                <tr>
                  <th>暱稱</th>
                  <td></td>
                  <td>{currentUser.username}</td>
                </tr>
                <tr>
                  <th>性別</th>
                  <td></td>
                  <td>{currentUser.gender}</td>
                </tr>
                <tr>
                  <th>年齡</th>
                  <td></td>
                  <td>{currentUser.age}</td>
                </tr>
                <tr>
                  <th>狀態</th>
                  <td></td>
                  <td>{currentUser.public ? "公開" : "不公開"}</td>
                </tr>
                <tr style={{ borderBottom: "white" }}>
                  <th>帳號創建於</th>
                  <td></td>
                  <td>{timeConvert(currentUser.createdDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="ms-2 my-4 fw-bold">自我簡介：</div>
            <div style={{ margin: "0.5rem", whiteSpace: "pre-line" }}>
              {currentUser.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
