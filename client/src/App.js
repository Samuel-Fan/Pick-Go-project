import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "./service/auth";
import Layout from "./components/homePageComponents/Layout";
import HomeComponent from "./components/homePageComponents/home-component";
import AppExample from "./AppExample";
import LoginComponent from "./components/homePageComponents/login-component";
import SignupComponent from "./components/homePageComponents/signup-component";
import GoogleLogin from "./components/homePageComponents/googleLogin";
import MyPageLayout from "./components/myPageComponents/MyPageLayout";
import Profile from "./components/myPageComponents/profile/profile-component";
import EditProfile from "./components/myPageComponents/profile/editProfile-component";
import EditPassword from "./components/myPageComponents/profile/editPassword-component";
import Sites from "./components/myPageComponents/site/sites-component";
import AddNewSite from "./components/myPageComponents/site/addNewSite-component";
import SiteDetail from "./components/homePageComponents/siteDetail-component";
import EditSite from "./components/myPageComponents/site/editSite-component";
import NoAuth from "./components/myPageComponents/noAuth-component";
import NotFound from "./components/homePageComponents/notFound";

function App() {
  let [auth, setAuth] = useState(JSON.parse(localStorage.getItem("auth"))); // 確認登入狀態
  let [currentUser, setCurrentUser] = useState(""); // 檢視使用者資料

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout auth={auth} />}>
          <Route index element={<HomeComponent auth={auth} />}></Route>
          <Route path="react" element={<AppExample />}></Route>
          <Route path="/site/:site_id" element={<SiteDetail />}></Route>
          <Route
            path="login"
            element={<LoginComponent setAuth={setAuth} />}
          ></Route>
          <Route path="signup" element={<SignupComponent />}></Route>
        </Route>
        <Route path="googleLogin" element={<GoogleLogin />}></Route>
        <Route
          path="/users"
          element={
            !window.localStorage.getItem("auth") ? (
              <Navigate to="/login" />
            ) : (
              <MyPageLayout
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            )
          }
        >
          <Route
            index
            element={
              <Profile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          ></Route>
          <Route path="/users/edit" element={<EditProfile />}></Route>
          <Route
            path="/users/editPassword"
            element={
              <EditPassword
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          ></Route>
          <Route
            path="/users/sites/overview/:category"
            element={<Sites />}
          ></Route>
          <Route path="/users/sites/new" element={<AddNewSite />}></Route>
          <Route
            path="/users/sites/edit/:site_id"
            element={<EditSite />}
          ></Route>
        </Route>
        <Route path="/noAuth" element={<NoAuth />}></Route>
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
