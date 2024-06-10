import React from "react";
import notFound from "../../images/404.jpg";

// 404 not found

const NotFound = () => {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div style={{ width: "600px" }}>
        <img
          src={notFound}
          alt="404_not_Found"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
};

export default NotFound;
