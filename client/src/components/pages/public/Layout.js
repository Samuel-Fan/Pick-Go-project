import React from "react";
import { Outlet } from "react-router-dom";
import NavComponent from "./navbar";
import Footer from "./footer";

const Layout = ({ auth }) => {
  return (
    <div>
      <NavComponent auth={auth} />
      <div id="page-container">
        <div id="content-wrap">
          <Outlet />
        </div>
        <div id="footer">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout;
