import React from "react";
import { Outlet } from "react-router-dom";
import NavComponent from "./nav-component";

const Layout = ({ auth }) => {
  return (
    <div>
      <NavComponent auth={auth} />
      <Outlet />
    </div>
  );
};

export default Layout;
