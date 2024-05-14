import React from "react";
import { useState, useEffect } from "react";
import authService from "../../service/auth";
import { useNavigate } from "react-router-dom";

const SignupComponent = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      let data = { email, password, confirmPassword, username };
      let result = await authService.post_signup(data);
      await authService.get_logout();
      alert("成功註冊");
      navigate("/");
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 400) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleRegister();
    }
  };

  const handleUsernameInput = (e) => {
    setUsername(e.target.value);
  };

  const handleEmailInput = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordInput = (e) => {
    setConfirmPassword(e.target.value);
  };

  return (
    // Section: Design Block
    <section>
      {/*  Jumbotron */}
      <div
        className="px-4 py-5 px-md-5 text-center text-lg-start"
        style={{ backgroundColor: "hsl(0, 0%, 96%)" }}
      >
        <div className="container">
          <div className="row gx-lg-5 align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className=" display-3 fw-bold ls-tight">
                The best offer <br />
                <span className="text-primary">for your Vacation</span>
              </h1>
              <p style={{ color: "hsl(217, 10%, 50.8%)" }}>
                探索世界，踏上精彩旅程！搜尋旅程，輕鬆找到您心目中的完美行程；規劃旅程，量身打造獨一無二的探險體驗；分享景點，與他人交流心得，探索未知之美；搜尋景點，發現世界各地的奇觀與寶藏。讓我們一起開展一段難忘的旅程，創造屬於您的精彩回憶！
              </p>
            </div>

            <div className="col-lg-6 mb-5 mb-lg-0">
              <div className="card">
                <div className="card-body py-5 px-md-5">
                  <form>
                    {/* 2 column grid layout with text inputs for the first and last names */}

                    {/* Email input */}
                    <div data-mdb-input-init className="form-outline mb-4">
                      <input
                        type="email"
                        id="signup-email"
                        className="form-control"
                        name="email"
                        onChange={handleEmailInput}
                        onKeyUp={handleEnter}
                      />
                      <label className="form-label" htmlFor="signup-email">
                        Email address
                      </label>
                    </div>

                    {/*  Password input */}
                    <div data-mdb-input-init className="form-outline mb-4">
                      <input
                        type="password"
                        id="signup-password"
                        className="form-control"
                        name="signup-password"
                        onChange={handlePasswordInput}
                        onKeyUp={handleEnter}
                      />
                      <label className="form-label" htmlFor="signup-password">
                        Password
                      </label>
                    </div>
                    {/*  confirmPassword input */}
                    <div data-mdb-input-init className="form-outline mb-4">
                      <input
                        type="password"
                        id="signup-confirmpassword"
                        className="form-control"
                        name="confirmpassword"
                        onChange={handleConfirmPasswordInput}
                        onKeyUp={handleEnter}
                      />
                      <label
                        className="form-label"
                        htmlFor="signup-confirmpassword"
                      >
                        confirmPassword
                      </label>
                    </div>
                    <div data-mdb-input-init className="form-outline mb-4">
                      <input
                        type="text"
                        id="signup-username"
                        className="form-control"
                        name="username"
                        onChange={handleUsernameInput}
                        onKeyUp={handleEnter}
                      />
                      <label className="form-label" htmlFor="signup-username">
                        username
                      </label>
                    </div>

                    {/* <!-- error message --> */}
                    <div className="small mb-2 pb-lg-2">
                      {message && (
                        <div className="alert alert-danger" role="alert">
                          {message}
                        </div>
                      )}
                    </div>

                    {/* <!-- Submit button --> */}
                    <button
                      type="button"
                      className="btn btn-primary btn-block mb-4"
                      onClick={handleRegister}
                    >
                      Sign up
                    </button>

                    {/* <!-- Google register buttons --> */}
                    <div className="text-center">
                      <a
                        href={`${process.env.REACT_APP_API_URL}/api/users/auth/google`}
                      >
                        <button
                          className="btn btn-lg btn-block btn-primary"
                          style={{ backgroundColor: "#dd4b39" }}
                          type="button"
                        >
                          <i className="fab fa-google me-2"></i> Sign up with
                          google
                        </button>
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- Jumbotron --> */}
    </section>
    // <!-- Section: Design Block -->
  );
};

export default SignupComponent;
