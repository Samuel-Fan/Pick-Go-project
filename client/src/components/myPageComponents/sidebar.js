import React from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../service/auth";

const Sidebar = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      let result = await authService.get_logout();
      alert(result.data);
      window.localStorage.removeItem("user");
      navigate("/");
      navigate(0); // 刷新頁面
    } catch (e) {
      alert("某些錯誤發生: " + e);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
      <a
        href="/"
        className="d-flex align-items-center pb-3 mb-md-0 mt-md-3 me-md-auto text-white text-decoration-none white-nav-link"
      >
        <i className="fs-4 fa-solid fa-house"></i>
        <span className="fs-5 d-none d-sm-inline ms-md-2">回到首頁</span>
      </a>
      <ul
        className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
        id="menu"
      >
        <li className="nav-item">
          <div className="nav-link align-middle px-0 text-white">
            <span className="ms-1 d-none d-sm-inline ">
              {currentUser ? currentUser.username + " 的" : "我的"}
              頁面
            </span>
          </div>
        </li>
        <li>
          <hr />
          <Link to="/users" className="nav-link px-0 align-middle">
            <i className="fs-4 fa-solid fa-user"></i>
            <span className="ms-1 d-none d-sm-inline">個人資訊</span>
          </Link>
        </li>
        <li>
          <a href="#" className="nav-link px-0 align-middle">
            <i className="fs-4 fa-solid fa-location-dot"></i>
            <span className="ms-1 d-none d-sm-inline">我的景點</span>
          </a>
        </li>
        <li>
          <a href="#submenu2" className="nav-link px-0 align-middle ">
            <i className="fs-4 fa-solid fa-plane"></i>
            <span className="ms-1 d-none d-sm-inline">我的旅程</span>
          </a>
          <hr />
        </li>
        <li>
          <button
            href="/"
            className="nav-link px-0 align-middle white-nav-link"
            onClick={handleLogout}
          >
            <i className="fs-4 fa-solid fa-arrow-up-right-from-square"></i>
            <span className="ms-1 d-none d-sm-inline ">登出系統</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
