import React from "react";
import { Outlet } from "react-router-dom";
import NavComponent from "./navbar";

const Layout = ({ auth }) => {
  return (
    <div>
      <NavComponent auth={auth} />
      <Outlet />
    </div>
  );
};

export default Layout;
