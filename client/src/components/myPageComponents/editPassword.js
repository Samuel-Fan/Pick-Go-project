import React from "react";
import { useState, useEffect } from "react";
import authService from "../../service/auth";
import { useNavigate } from "react-router-dom";

const EditPassword = ({ currentUser }) => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleEditPassword = async () => {
    let data = { oldPassword, password, confirmPassword };

    try {
      let result = await authService.patch_modify_password(data);
      alert(result.data);
      navigate("/users");
    } catch (e) {
      if (e.response && e.response.status === 401) {
        console.log(e.response.data);
        alert("請重新登入後再嘗試");
        localStorage.removeItem("user");
        navigate("/login");
        navigate(0);
      } else if (e.response && e.response.status === 400) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  const handleOldPasswordInput = (e) => {
    setOldPassword(e.target.value);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordInput = (e) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <div className="container">
      <div className="d-flex flex-wrap">
        <h2 className="me-4 my-2">變更密碼</h2>
      </div>
      <hr />
      <form id="editProfileForm">
        {currentUser.password && (
          <div className="mb-3">
            <label htmlFor="old_password_edit" className="form-label">
              請輸入舊密碼
            </label>
            <input
              type="password"
              className="form-control"
              id="old_password_edit"
              onChange={handleOldPasswordInput}
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
            onChange={handlePasswordInput}
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
            onChange={handleConfirmPasswordInput}
          />
        </div>
        <p className="small mb-2 pb-lg-2">
          {message && (
            <div className="alert alert-danger" role="alert">
              {message}
            </div>
          )}
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleEditPassword}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EditPassword;
