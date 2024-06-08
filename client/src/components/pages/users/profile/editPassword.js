import React from "react";
import { useState, useEffect } from "react";
import authService from "../../../../service/auth";
import { useNavigate } from "react-router-dom";

// 變更使用者密碼

const EditPassword = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const handleEditPassword = async (e) => {
    e.preventDefault();
    let form = new FormData(e.currentTarget);
    let data = Object.fromEntries(form.entries());

    try {
      await authService.patch_modify_password(data);
      alert("成功修改密碼");
      navigate("/users");
    } catch (e) {
      if (e.response) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  // 取得使用者資料
  useEffect(() => {
    authService
      .get_auth_user()
      .then((data) => {
        let user = data.data;
        setCurrentUser(user);
      })
      .catch((e) => {
        navigate("/login");
        navigate(0);
      });
  }, [navigate, setCurrentUser]);

  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        <h2 className="me-4 my-2">變更密碼</h2>
      </div>
      <hr />
      <form id="editProfileForm" onSubmit={handleEditPassword}>
        {currentUser.password && (
          <div className="mb-3">
            <label htmlFor="old_password_edit" className="form-label">
              請輸入舊密碼
            </label>
            <input
              type="password"
              className="form-control"
              id="old_password_edit"
              name="oldPassword"
              autocomplete="off"
            />
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="password_edit" className="form-label">
            新密碼
          </label>
          <input
            type="password"
            className="form-control"
            id="password_edit"
            name="password"
            autocomplete="off"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="confirm_password_edit" className="form-label">
            確認新密碼
          </label>
          <input
            type="password"
            className="form-control"
            id="confirm_password_edit"
            name="confirmPassword"
            autoComplete="off"
          />
        </div>
        <div className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default EditPassword;
