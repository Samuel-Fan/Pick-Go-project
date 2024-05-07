import React from "react";
import authService from "../service/auth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const NavComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      let result = await authService.get_logout();
      alert(result.data);
      setCurrentUser("");
      navigate("/");
    } catch (e) {
      alert("某些錯誤發生: " + e);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary bg-info-subtle">
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
          <ul className="navbar-nav mb-2 mb-lg-0 ms-auto me-5 ">
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle active"
                to="/"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {currentUser ? currentUser.data.username + " 的" : "我的"}帳號
              </Link>
              <ul className="dropdown-menu ">
                {!currentUser && (
                  <li>
                    <Link className="dropdown-item" to="/login">
                      登入
                    </Link>
                  </li>
                )}

                {currentUser && (
                  <li>
                    <Link className="dropdown-item" to="/">
                      檢視我的旅程
                    </Link>
                  </li>
                )}
                {currentUser && (
                  <li>
                    <Link className="dropdown-item" href="/">
                      設定
                    </Link>
                  </li>
                )}
                {currentUser && (
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                )}
                {currentUser && (
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
              {!currentUser && (
                <Link className="nav-link active" to="/signup">
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
