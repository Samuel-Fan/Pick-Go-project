import React from "react";
import { useState, useEffect } from "react";
import authService from "../../../../service/auth";
import { useNavigate } from "react-router-dom";

// 變更使用者資料(不含密碼)

const EditProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [userPublic, setUserPublic] = useState("");
  const [removeOriginPhoto, setRemoveOriginPhoto] = useState(false);
  const [message, setMessage] = useState("");

  const handleEditProfile = async (e) => {
    e.preventDefault();
    let formData = new FormData(e.currentTarget);
    formData.append("public", userPublic);

    // 如有編輯新照片或移除舊照片，則設定參數告訴後台要刪除照片
    if (formData.get("photo").name) {
      formData.append("removeOriginPhoto", true);
    } else {
      formData.append("removeOriginPhoto", removeOriginPhoto);
    }

    // loading中禁用submit按鈕，設定游標
    document.body.style.cursor = "wait";
    document.querySelector("#edit-user-submit-button").disabled = true;

    try {
      let result = await authService.patch_modify(formData);

      // 若有更新username，也同時更新localstorage的簡易資料
      let auth = JSON.parse(localStorage.getItem("auth"));
      auth.username = result.data.username;
      localStorage.setItem("auth", JSON.stringify(auth));

      // 重新導向
      navigate("/users");
      navigate(0); // 刷新頁面
    } catch (e) {
      // 回復游標與submit按鈕
      document.body.style.cursor = "default";
      document.querySelector("#edit-user-submit-button").disabled = false;

      console.log(e);
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  // 檢查圖片格式
  const handleImage = (e) => {
    if (e.target.files[0]) {
      let file = e.target.files[0];
      let size = file.size;
      let type = file.type;

      if (
        type !== "image/jpeg" &&
        type !== "image/png" &&
        type !== "image/jpg"
      ) {
        // 只允許上傳 jpeg 或 png 檔

        setMessage("只能上傳 jpeg, jpg 或 png 檔!");
        document.querySelector("#photo_user_edit").value = null;
      } else if (size > 2.5 * 1024 * 1024) {
        // 如果檔案大小大於 2.5 MB，不允許上傳

        setMessage("圖片過大，請使用其它方式上傳！(限制 2.5 MB)");
        document.querySelector("#photo_user_edit").value = null;
      } else {
        setMessage("");
      }
    } else {
      document.querySelector("#photo_user_edit").value = null;
    }
  };

  // 移除舊照片
  const removePhoto = () => {
    setRemoveOriginPhoto(true);
    document.querySelector("#origin_photo").textContent = "";
    document.querySelector("#removePhotoButton").style.display = "none";
  };

  // 資料公開不公開
  const handlePublic = () => {
    setUserPublic(!userPublic);
  };

  useEffect(() => {
    // 等待讀取，暫停按鈕使用
    document.body.style.cursor = "wait";
    document.querySelector("#edit-user-submit-button").disabled = true;

    // 取得使用者資料
    authService
      .get_auth_user()
      .then((data) => {
        let user = data.data;
        setUser(user);

        setUserPublic(user.public ? true : false);

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
        // 公開設定
        setUserPublic(user.public);
        if (user.public) {
          document.querySelector("#publicButton").checked = true;
        }

        // 回復游標及按鈕
        document.body.style.cursor = "default";
        document.querySelector("#edit-user-submit-button").disabled = false;
      })
      .catch((e) => {
        if (e.response) {
          switch (e.response.status) {
            case 401:
              alert("您需要先登入");
              break;
            default:
              alert(e.response.data);
              break;
          }
        } else {
          alert("伺服器發生問題");
        }
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
            defaultValue={user.username}
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
            defaultValue={user.age}
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
            defaultValue={user.description}
          ></textarea>
        </div>
        <div className="mb-3">
          {user.photo && user.photo.photoName && (
            <div className="d-flex my-2">
              <div className="my-auto">
                原照片：<span id="origin_photo">{user.photo.photoName}</span>
              </div>
              <button
                id="removePhotoButton"
                className="btn bg-danger-subtle ms-2"
                type="button"
                onClick={removePhoto}
              >
                移除照片
              </button>
            </div>
          )}

          <label htmlFor="photo_user_edit" className="mb-3">
            上傳新照片(會取代舊的)
          </label>
          <input
            type="file"
            className="form-control"
            id="photo_user_edit"
            name="photo"
            onChange={handleImage}
          />
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="publicButton"
            onChange={handlePublic}
          />
          <label className="form-check-label" htmlFor="publicButton">
            {userPublic ? "公開" : "不公開"}
          </label>
        </div>
        <div className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </div>
        <button
          type="submit"
          id="edit-user-submit-button"
          className="btn btn-primary"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
