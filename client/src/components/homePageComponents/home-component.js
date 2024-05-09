import React from "react";
import authService from "../../service/auth";

const HomeComponent = ({ currentUser }) => {
  const test = async () => {
    try {
      let result = await authService.get_auth_test();
      console.log(result);
      console.log(currentUser )
      return result;
    } catch (e) {
      console.log(e);
    }
  };

  return <button onClick={test}>123</button>;
};

export default HomeComponent;
