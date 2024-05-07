import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "./service/auth";
import Layout from "./components/Layout";
import HomeComponent from "./components/home-component";
import AppExample from "./AppExample";
import LoginComponent from "./components/login-component";
import SignupComponent from "./components/signup-component";
import Test from "./components/test";
import MyPageLayout from "./components/myPageComponents/MyPageLayout";

function App() {
  let [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    // 如果登入仍然有效，currentUser state 存入使用者資料
    authService
      .get_auth_user()
      .then((data) => {
        setCurrentUser(data);
      })
      .catch((e) => {
        console.log(e);
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
          <Route index element={<HomeComponent />}></Route>
          <Route path="react" element={<AppExample />}></Route>
          <Route
            path="login"
            element={
              <LoginComponent
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          ></Route>
          <Route
            path="signup"
            element={
              <SignupComponent
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          ></Route>
          <Route path="myPage" element={<MyPageLayout />}></Route>
          <Route path="test" element={<Test />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
