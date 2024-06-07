import React, { useState, useEffect } from "react";
import authService from "../../service/auth";

const ProfileComponent = ({ user_id, setUser_id }) => {
  const [user, setUser] = useState("");

  useEffect(() => {
    // 取得使用者詳細資料
    authService
      .get_profile(user_id)
      .then((data) => {
        setUser(data.data);
      })
      .catch((e) => {
        alert("伺服器發生錯誤");
      });
  }, [user_id]);

  return (
    <div className="container">
      <div
        className="rounded border"
        style={{
          position: "absolute",
          zIndex: "10",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "1rem",
          width: "50rem",
          height: "40rem",
          overflowY: "scroll",
        }}
      >
        <h2 className="me-4 my-2 text-center">個人資料頁面</h2>
        <hr />
        <table className="table" style={{ marginBottom: "0" }}>
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col"></th>
              <th scope="col">{user && user.email}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">暱稱</th>
              <td></td>
              <td>{user && user.username}</td>
            </tr>
            <tr>
              <th scope="row">性別</th>
              <td></td>
              <td>{user && user.gender}</td>
            </tr>
            <tr>
              <th scope="row">年齡</th>
              <td></td>
              <td>{user && user.age}</td>
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
            {user && user.description}
          </div>
        </div>

        <button
          type="button"
          className="btn-close"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
          }}
          onClick={() => {
            setUser_id("");
          }}
        ></button>
      </div>

      {/* 遮罩 */}
      <div
        id="gray_cover"
        style={{
          display: "block",
          height: "100vh",
          width: "100vw",
          opacity: "80%",
          backgroundColor: "black",
          position: "fixed",
          top: "0",
          left: "0",
          zIndex: "1",
        }}
      ></div>
    </div>
  );
};

export default ProfileComponent;
