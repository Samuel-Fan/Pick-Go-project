import noAuth from "../../images/403.jpg";
import React from "react";

// 403 無權限

const NoAuth = () => {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ marginTop: "10px" }}
    >
      <div>
        <p className="h2">相關頁面不對外開放</p>
        <p className="h4 my-3">若是以下情形，您可至個人頁面查看：</p>
        <ul className="h4 ">
          <li>您建立的旅程</li>
          <li>您參加的旅程</li>
          <li>您建立的景點</li>
        </ul>
      </div>
      <div style={{ height: "600px", width: "600px" }}>
        <img
          src={noAuth}
          alt="404_not_Found"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
};

export default NoAuth;
