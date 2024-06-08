import React, { useState, useEffect } from "react";
import authService from "../../service/auth";

// 公開的使用者介面

const Profile = ({ user_id, setUser_id }) => {
  const [user, setUser] = useState("");

  // 客製化日期
  const timeConvert = (string) => {
    return string.match(/\d+-\d+-\d+/);
  };

  useEffect(() => {
    // 取得使用者詳細資料
    authService
      .get_profile(user_id)
      .then((data) => {
        setUser(data.data);
      })
      .catch((e) => {
        if (e.response && e.response.status === 403) {
          setUser("403");
        } else {
          alert(e.response ? e.response.data : "伺服器發生錯誤");
        }
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
        {user ? (
          user === "403" ? (
            <p className="h2 text-center">該使用者不公開資料</p>
          ) : (
            <div>
              <div className="d-flex flex-wrap justify-content-center border">
                {user.photo.url && (
                  <div className="me-4 border" style={{ flex: "0 1 250px" }}>
                    <img
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      src={user.photo.url}
                      alt={user.photo.photoName}
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
                      <th>{user.email}</th>
                    </tr>
                    <tr>
                      <th>暱稱</th>
                      <td></td>
                      <td>{user.username}</td>
                    </tr>
                    <tr>
                      <th>性別</th>
                      <td></td>
                      <td>{user.gender}</td>
                    </tr>
                    <tr>
                      <th>年齡</th>
                      <td></td>
                      <td>{user.age}</td>
                    </tr>
                    <tr style={{ borderBottom: "white" }}>
                      <th>帳號創建於</th>
                      <td></td>
                      <td>
                        {user.createdDate && timeConvert(user.createdDate)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className="ms-2 my-4 fw-bold">自我簡介：</div>
                <div style={{ margin: "0.5rem", whiteSpace: "pre-line" }}>
                  {user.description}
                </div>
              </div>
            </div>
          )
        ) : null}

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

export default Profile;
