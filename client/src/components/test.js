import React from "react";

const Test = () => {
  return (
    <form
      action="https://8080-samuelfan-pickgoproject-063jy55okjc.ws-us110.gitpod.io/api/users/login"
      method="post"
    >
      <input type="email" name="username" />
      <input type="password" name="password" />
      <button>submit</button>
    </form>
  );
};

export default Test;
