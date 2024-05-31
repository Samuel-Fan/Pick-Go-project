import React from "react";
import { useState } from "react";
import authService from "../../service/auth";
import { useNavigate } from "react-router-dom";

const SignupComponent = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    let form = new FormData(e.currentTarget);
    let data = Object.fromEntries(form.entries());
    console.log(form.entries());
    try {
      await authService.post_signup(data);
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
                  <form onSubmit={handleRegister}>
                    {/* 2 column grid layout with text inputs for the first and last names */}

                    {/* Email input */}
                    <div data-mdb-input-init className="form-outline mb-4">
                      <input
                        type="email"
                        id="signup-email"
                        className="form-control"
                        name="email"
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
                        name="password"
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
                        name="confirmPassword"
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
                    <button className="btn btn-primary btn-block mb-4">
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
