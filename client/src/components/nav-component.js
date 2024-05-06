import React from "react";
import { Link } from "react-router-dom";

const NavComponent = () => {
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          首頁
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active " aria-current="page" to="/">
                行程瀏覽
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                景點瀏覽
              </Link>
            </li>
          </ul>
          <form className="d-flex" role="search">
            <input
              id="search"
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button className="btn btn-outline-success" type="submit">
              Search
            </button>
          </form>
          <ul className="navbar-nav mb-2 mb-lg-0 ms-auto me-2 ">
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle active"
                to="/"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                我的帳號
              </Link>
              <ul className="dropdown-menu ">
                <li>
                  <Link className="dropdown-item" to="/login">
                    登入
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/">
                    登出
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" href="/">
                    設定
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <Link className="dropdown-item " href="/">
                    檢視我的旅程
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item me-2">
              <Link className="nav-link active" to="/">
                註冊
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavComponent;
