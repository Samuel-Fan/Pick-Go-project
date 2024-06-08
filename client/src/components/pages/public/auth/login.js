import React from "react";
import { useState } from "react";
import authService from "../../../../service/auth";
import { useNavigate } from "react-router-dom";

// 登入

const Login = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    let form = new FormData(e.currentTarget);
    let data = Object.fromEntries(form.entries());
    try {
      let result = await authService.post_login(data);
      localStorage.setItem(
        "auth",
        JSON.stringify({
          _id: result.data.user._id,
          username: result.data.user.username,
          jwtToken: result.data.jwtToken,
        })
      );
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

  return (
    <section>
      <div className="container py-2 ">
        <div className="row d-flex align-items-center justify-content-center h-100 ">
          <div className="col-xl-6">
            <img
              src="https://img.freepik.com/free-vector/travel-concept-with-landmarks_1057-4873.jpg?t=st=1715064829~exp=1715068429~hmac=87777009ecf1996440171e92d5f2634a1c1289bae34dc314c2e7c55a8a9302ce&w=826"
              className="img-fluid"
              alt="登入小圖案"
            />
          </div>
          <div className="col-xl-5 offset-xl-1 my-5">
            <form onSubmit={handleSubmit}>
              {/* <!-- Email input --> */}
              <div data-mdb-input-init className="form-outline mb-4">
                <input
                  type="email"
                  id="signin-email"
                  className="form-control form-control-lg"
                  name="email"
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
                />
                <label className="form-label" htmlFor="signin-password">
                  Password
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
              <button className="btn btn-primary btn-lg btn-block">
                Sign in
              </button>
              <div className="divider d-flex align-items-center my-4">
                <p className="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
              </div>
            </form>

            {/* <!-- google login --> */}
            <a href={`${process.env.REACT_APP_API_URL}/api/users/auth/google`}>
              <button
                className="btn btn-lg btn-block btn-primary"
                style={{ backgroundColor: "#dd4b39" }}
                type="button"
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

export default Login;
