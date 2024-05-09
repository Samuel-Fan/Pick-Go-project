import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "./service/auth";
import Layout from "./components/homePageComponents/Layout";
import HomeComponent from "./components/homePageComponents/home-component";
import AppExample from "./AppExample";
import LoginComponent from "./components/homePageComponents/login-component";
import SignupComponent from "./components/homePageComponents/signup-component";
import MyPageLayout from "./components/myPageComponents/MyPageLayout";
import Profile from "./components/myPageComponents/profile";
import EditProfile from "./components/myPageComponents/editProfile";

function App() {
  let [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    // 如果登入仍然有效，currentUser state 存入使用者資料
    authService
      .get_auth_user()
      .then((data) => {
        setCurrentUser(data.data);
      })
      .catch((e) => {
        window.localStorage.removeItem("auth");
        setCurrentUser("");
      });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout currentUser={currentUser} setCurrentUser={setCurrentUser} />
          }
        >
          <Route
            index
            element={<HomeComponent currentUser={currentUser} />}
          ></Route>
          <Route path="react" element={<AppExample />}></Route>
          <Route
            path="login"
            element={<LoginComponent setCurrentUser={setCurrentUser} />}
          ></Route>
          <Route path="signup" element={<SignupComponent />}></Route>
        </Route>
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
          <Route index element={<Profile currentUser={currentUser} />}></Route>
          <Route
            path="/users/edit"
            element={
              <EditProfile
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          ></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
