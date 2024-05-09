import React from "react";
import { useState } from "react";
import authService from "../../service/auth";
import { useNavigate } from "react-router-dom";

const LoginComponent = ({ setCurrentUser }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      let result = await authService.post_login(username, password);
      window.localStorage.setItem("user", JSON.stringify(result.data));
      alert("成功登入");
      navigate("/");
      navigate(0);
    } catch (e) {
      console.log(e);
      if (e.response && e.response.status === 401) {
        setMessage("帳號或密碼不正確。");
      } else if (e.response && e.response.status === 400) {
        setMessage(e.response.data);
      } else {
        setMessage("伺服器發生問題，請稍後再試");
      }
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleUsernameInput = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  return (
    <section className="vh-100">
      <div className="container py-5 ">
        <div className="row d-flex align-items-center justify-content-center h-100 ">
          <div className="col-md-8 col-lg-7 col-xl-6">
            <img
              src="https://img.freepik.com/free-vector/travel-concept-with-landmarks_1057-4873.jpg?t=st=1715064829~exp=1715068429~hmac=87777009ecf1996440171e92d5f2634a1c1289bae34dc314c2e7c55a8a9302ce&w=826"
              className="img-fluid"
              alt="Phone image"
            />
          </div>
          <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
            <form>
              {/* <!-- Email input --> */}
              <div data-mdb-input-init className="form-outline mb-4">
                <input
                  type="email"
                  id="signin-email"
                  className="form-control form-control-lg"
                  name="username"
                  onChange={handleUsernameInput}
                  onKeyUp={handleEnter}
                />
                <label className="form-label" htmlFor="signIn-email">
                  Email address
                </label>
              </div>

              {/* <!-- Password input --> */}
              <div data-mdb-input-init className="form-outline mb-4">
                <input
                  type="password"
                  id="signin-password"
                  className="form-control form-control-lg"
                  name="password"
                  onChange={handlePasswordInput}
                  onKeyUp={handleEnter}
                />
                <label className="form-label" htmlFor="signin-password">
                  Password
                </label>
              </div>

              <p className="small mb-2 pb-lg-2">
                {message && (
                  <div className="alert alert-danger" role="alert">
                    {message}
                  </div>
                )}
              </p>

              {/* <!-- Submit button --> */}
              <button
                type="button"
                className="btn btn-primary btn-lg btn-block"
                onClick={handleLogin}
              >
                Sign in
              </button>

              <div className="divider d-flex align-items-center my-4">
                <p className="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
              </div>
            </form>
            <a href={`${process.env.REACT_APP_API_URL}/api/users/auth/google`}>
              <button
                className="btn btn-lg btn-block btn-primary"
                style={{ backgroundColor: "#dd4b39" }}
                type="submit"
              >
                <i className="fab fa-google me-2"></i> Continue with google
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginComponent;
