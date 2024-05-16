import React from "react";
import { useState, useEffect } from "react";
import authService from "../../../service/auth";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState();
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };

  const handleAge = (e) => {
    setAge(e.target.value);
  };

  const handleGender = (e) => {
    setGender(e.target.value);
  };

  const handleDescription = (e) => {
    setDescription(e.target.value);
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    let data = { username, age, gender, description };
    try {
      let result = await authService.patch_modify(data);
      localStorage.setItem("user", JSON.stringify(result.data));
      navigate("/users");
      navigate(0); // 刷新頁面
    } catch (e) {
      if (e.response && e.response.status === 401) {
        setMessage("請重新登入後再嘗試");
        localStorage.removeItem("auth");
        navigate("/login");
        navigate(0);
      } else if (e.response && e.response.status !== 401) {
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
        setUsername(user.username);
        setAge(user.age);
        setGender(user.gender);
        setDescription(user.description);

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
        }
      })
      .catch((e) => {
        navigate("/login");
        navigate(0);
      });
  }, []);

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
            value={username}
            onChange={handleUsername}
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
            value={age}
            onChange={handleAge}
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
                  onChange={handleGender}
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
                  onChange={handleGender}
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
                  onChange={handleGender}
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
            value={description}
            id="descriptionEdit"
            onChange={handleDescription}
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
