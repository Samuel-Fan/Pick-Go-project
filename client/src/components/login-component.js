import React from "react";
import { useState } from "react";
import authService from "../service/auth";
import { useNavigate } from "react-router-dom";

const LoginComponent = () => {
  const navigate = useNavigate();
  let [username, setUsername] = useState("");
  let [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      let result = await authService.post_login(username, password);
      console.log(result);
      //   navigate("/");
    } catch (e) {
      console.log(e);
    }
  };

  const handleUsernameInput = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  const test = async () => {
    try {
      let result = await authService.get_auth_test();
      console.log(result);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="container-md">
      <form action="">
        {" "}
        {/* //要記得改 */}
        <div class="mb-3">
          <label for="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            name="username"
            aria-describedby="emailHelp"
            onChange={handleUsernameInput}
          />
          <div id="emailHelp" className="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div className="mb-3">
          <label for="exampleInputPassword1" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="form-control"
            id="exampleInputPassword1"
            onChange={handlePasswordInput}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handleLogin}>
          Submit
        </button>
      </form>
      <button onClick={test}>test</button>
    </div>
  );
};

export default LoginComponent;
