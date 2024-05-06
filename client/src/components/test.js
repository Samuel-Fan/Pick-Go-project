import React from "react";

const Test = () => {
  return (
    <div className="test">
      <form
        className="form"
        action="https://8080-samuelfan-pickgoproject-063jy55okjc.ws-us110.gitpod.io/api/users/login"
        method="post"
      >
        <input type="email" name="username" />
        <input type="password" name="password" />
        <button>submit</button>
      </form>
      <h1>
        <a href="https://8080-samuelfan-pickgoproject-063jy55okjc.ws-us110.gitpod.io/api/users/auth/google">
          登入google
        </a>
      </h1>
    </div>
  );
};

export default Test;
