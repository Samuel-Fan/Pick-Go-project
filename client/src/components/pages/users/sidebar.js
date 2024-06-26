import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    window.localStorage.removeItem("auth");
    navigate("/");
    navigate(0); // 刷新頁面
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
            <span className="ms-1 d-none d-sm-inline ">我的頁面</span>
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
          <Link
            to="/users/sites/overview/mine"
            className="nav-link px-0 align-middle"
          >
            <i className="fs-4 fa-solid fa-location-dot"></i>
            <span className="ms-1 d-none d-sm-inline">我的景點</span>
          </Link>
        </li>
        <li>
          <Link
            to="/users/tours/overview"
            className="nav-link px-0 align-middle "
          >
            <i className="fs-4 fa-solid fa-plane"></i>
            <span className="ms-1 d-none d-sm-inline">我的旅程</span>
          </Link>
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
