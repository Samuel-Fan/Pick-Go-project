import React from "react";
import { Outlet } from "react-router-dom";
import NavComponent from "./nav-component";

const Layout = () => {
  return (
    <div>
      <NavComponent />
      <Outlet />
    </div>
  );
};

export default Layout;
