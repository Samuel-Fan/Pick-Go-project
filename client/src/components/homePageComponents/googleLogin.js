import React from "react";
import authService from "../../service/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const GoogleLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authService
      .get_google_jwt()
      .then((result) => {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            _id: result.data.user._id,
            username: result.data.user.username,
            jwtToken: result.data.jwtToken,
          })
        );
        navigate("/");
        navigate(0);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [navigate]);
  return <div></div>;
};

export default GoogleLogin;
