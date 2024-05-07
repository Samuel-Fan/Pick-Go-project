import React from "react";
import authService from "../service/auth";

const HomeComponent = () => {
  const test = async () => {
    try {
      let result = await authService.get_auth_test();
      console.log(result);
      return result;
    } catch (e) {
      console.log(e);
    }
  };

  return <button onClick={test}>123</button>;
};

export default HomeComponent;
