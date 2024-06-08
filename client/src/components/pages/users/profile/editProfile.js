import React from "react";
import { useState, useEffect } from "react";
import authService from "../../../../service/auth";
import { useNavigate } from "react-router-dom";

// 變更使用者資料(不含密碼)

const EditProfile = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleEditProfile = async (e) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    let data = Object.fromEntries(formData.entries());
    try {
      let result = await authService.patch_modify(data);
      let auth = JSON.parse(localStorage.getItem("auth"));
      console.log(auth);
      auth.username = result.data.username;
      localStorage.setItem("auth", JSON.stringify(auth));
      navigate("/users");
      navigate(0); // 刷新頁面
    } catch (e) {
      console.log(e);
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  useEffect(() => {
    // 取得使用者資料
    authService
      .get_auth_user()
      .then((data) => {
        let user = data.data;
        // setState
        document.querySelector("#usernameEdit").value = user.username || "";
        document.querySelector("#ageEdit").value = user.age || "";
        document.querySelector("#descriptionEdit").value =
          user.description || "";

        // 選取預設性別

        switch (user.gender) {
          case "男":
            document.querySelector("#gender_male").checked = true;
            break;
          case "女":
            document.querySelector("#gender_female").checked = true;
            break;
          case "其他":
            document.querySelector("#gender_other").checked = true;
            break;
          default:
            break;
        }
      })
      .catch((e) => {
        navigate("/login");
        navigate(0);
      });
  }, [navigate]);

  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        <h2 className="me-4 my-2">個人資料頁面</h2>
      </div>
      <hr />
      <form id="editProfileForm" onSubmit={handleEditProfile}>
        <div className="mb-3">
          <label htmlFor="usernameEdit" className="form-label">
            暱稱
          </label>
          <input
            type="text"
            className="form-control"
            id="usernameEdit"
            name="username"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="ageEdit" className="form-label">
            年齡
          </label>
          <input
            type="number"
            className="form-control"
            id="ageEdit"
            name="age"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="genderEdit" className="form-label">
            性別
          </label>
          <div id="genderEdit">
            <div className="form-check-inline ">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="gender_male"
                  value="男"
                />
                <label className="form-check-label" htmlFor="gender_male">
                  男
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="gender_female"
                  value="女"
                />
                <label className="form-check-label" htmlFor="gender_female">
                  女
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  id="gender_other"
                  value="其他"
                />
                <label className="form-check-label" htmlFor="gender_other">
                  其他
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="descriptionEdit" className="mb-3">
            自我介紹
          </label>
          <textarea
            className="form-control"
            id="descriptionEdit"
            name="description"
            rows="6"
            style={{ whiteSpace: "pre-line" }}
          ></textarea>
        </div>
        <div className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
