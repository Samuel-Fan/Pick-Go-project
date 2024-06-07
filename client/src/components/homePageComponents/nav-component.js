import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const NavComponent = ({ auth }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    window.localStorage.removeItem("auth");
    navigate("/");
    navigate(0); // 刷新頁面
  };

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: "rgb(90, 178, 255)",
        opacity: "0.8",
      }}
    >
      <div className="container-fluid">
        <Link
          className="navbar-brand custom-nav-hover"
          to="/"
          style={{ color: "black", fontWeight: "700" }}
        >
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
            <li className="nav-item custom-nav-hover">
              <Link
                className="nav-link"
                aria-current="page"
                to="/tours"
                style={{ color: "black", fontWeight: "700" }}
              >
                旅程規劃瀏覽
              </Link>
            </li>
            <li className="nav-item custom-nav-hover">
              <Link
                className="nav-link "
                to="/sites"
                style={{ color: "black", fontWeight: "700" }}
              >
                單一景點瀏覽
              </Link>
            </li>
          </ul>
          <ul className="navbar-nav mb-2 mb-lg-0 ms-auto me-5 ">
            <li
              className="nav-item dropdown"
              style={{ color: "black", fontWeight: "700" }}
            >
              <Link
                className="nav-link dropdown-toggle custom-nav-hover"
                to="/"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ color: "black", fontWeight: "700" }}
              >
                {auth ? auth.username + " 的" : "我的"}帳號
              </Link>
              <ul className="dropdown-menu ">
                {!auth && (
                  <li>
                    <Link className="dropdown-item" to="/login">
                      登入
                    </Link>
                  </li>
                )}

                {auth && (
                  <li>
                    <a className="dropdown-item" href="/users">
                      檢視我的旅程
                    </a>
                  </li>
                )}
                {auth && (
                  <li>
                    <a className="dropdown-item" href="/users">
                      設定
                    </a>
                  </li>
                )}
                {auth && (
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                )}
                {auth && (
                  <li>
                    <Link
                      className="dropdown-item "
                      href="/"
                      onClick={handleLogout}
                    >
                      登出
                    </Link>
                  </li>
                )}
              </ul>
            </li>
            <li className="nav-item me-2">
              {!auth && (
                <Link
                  className="nav-link custom-nav-hover"
                  to="/signup"
                  style={{ color: "black", fontWeight: "700" }}
                >
                  註冊
                </Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavComponent;
