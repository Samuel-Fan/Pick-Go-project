import React from "react";
import authService from "../../service/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const GoogleLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    authService
      .get_auth_user()
      .then((data) => {
        let user = data.data;
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/users");
        navigate(0);
      })
      .catch((e) => {
        localStorage.removeItem("user");
        navigate("/login");
        navigate(0);
      });
  }, []);
  return <div></div>;
};

export default GoogleLogin;
