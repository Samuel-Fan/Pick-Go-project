import React from "react";
import Sidebar from "./sidebar";
import { Outlet } from "react-router-dom";

const MyPageLayout = ({ currentUser, setCurrentUser }) => {
  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
          <Sidebar currentUser={currentUser} setCurrentUser={setCurrentUser} />
        </div>
        <div className="col py-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MyPageLayout;
