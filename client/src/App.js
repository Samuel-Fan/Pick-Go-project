import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/homePageComponents/Layout";
import Home from "./components/homePageComponents/home-component";
import SearchSites from "./components/homePageComponents/search-sites-component";
import SiteDetail from "./components/homePageComponents/siteDetail-component";
import SearchTours from "./components/homePageComponents/search-tours-component";
import TourDetail from "./components/homePageComponents/tourDetail-component";
import Login from "./components/homePageComponents/login-component";
import Signup from "./components/homePageComponents/signup-component";
import GoogleLogin from "./components/homePageComponents/googleLogin";
import MyPageLayout from "./components/myPageComponents/MyPageLayout";
import MyProfile from "./components/myPageComponents/profile/myProfile-component";
import EditProfile from "./components/myPageComponents/profile/editProfile-component";
import EditPassword from "./components/myPageComponents/profile/editPassword-component";
import MySites from "./components/myPageComponents/site/mySites-component";
import MyCollectSites from "./components/myPageComponents/site/myCollectSites-component";
import MySiteDetail from "./components/myPageComponents/site/mySiteDetail-component";
import AddNewSite from "./components/myPageComponents/site/addNewSite-component";
import EditSite from "./components/myPageComponents/site/editSite-component";
import MyTours from "./components/myPageComponents/tour/myTours-component";
import MyApplied from "./components/myPageComponents/tour/myApplied-component";
import AddNewTour from "./components/myPageComponents/tour/addNewTour-component";
import AddSiteToATour from "./components/myPageComponents/tour/addSiteToATour-component";
import AddNewParticipant from "./components/myPageComponents/tour/addNewParticipant-component";
import NoAuth from "./components/myPageComponents/noAuth-component";
import NotFound from "./components/homePageComponents/notFound";
import MyTourDetail from "./components/myPageComponents/tour/myTourDetail-component";

function App() {
  let [auth, setAuth] = useState(JSON.parse(localStorage.getItem("auth"))); // 確認登入狀態
  let [currentUser, setCurrentUser] = useState(""); // 檢視使用者資料

  return (
    <BrowserRouter>
      <Routes>
        {/* 首頁 (不須登入即可瀏覽的頁面) */}
        <Route path="/" element={<Layout auth={auth} />}>
          <Route index element={<Home auth={auth} />}></Route>
          <Route path="/tours" element={<SearchTours />}></Route>
          <Route path="tour/:tour_id" element={<TourDetail />}></Route>
          <Route path="/sites" element={<SearchSites />}></Route>
          <Route path="/site/:site_id" element={<SiteDetail />}></Route>
          <Route path="login" element={<Login setAuth={setAuth} />}></Route>
          <Route path="signup" element={<Signup />}></Route>
        </Route>

        {/* 處理google登入 */}
        <Route path="googleLogin" element={<GoogleLogin />}></Route>

        {/* 個人帳號頁面 */}
        <Route
          path="/users"
          element={
            !window.localStorage.getItem("auth") ? (
              <Navigate to="/login" />
            ) : (
              <MyPageLayout />
            )
          }
        >
          {/* 帳號資訊瀏覽、修改 */}
          <Route
            index
            element={
              <MyProfile
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

          {/* 景點建立、修改、瀏覽 */}
          <Route
            path="/users/sites/overview/mine"
            element={<MySites />}
          ></Route>
          <Route
            path="/users/sites/overview/collections"
            element={<MyCollectSites />}
          ></Route>
          <Route
            path="/users/mySite/:site_id"
            element={<MySiteDetail />}
          ></Route>
          <Route path="/users/sites/new" element={<AddNewSite />}></Route>
          <Route
            path="/users/sites/edit/:site_id"
            element={<EditSite />}
          ></Route>

          {/* 旅程建立、修改、瀏覽 */}
          <Route path="/users/tours/overview" element={<MyTours />}></Route>
          <Route path="/users/tours/new" element={<AddNewTour />}></Route>
          <Route
            path="/users/tours/overview/apply"
            element={<MyApplied />}
          ></Route>
          <Route
            path="/users/tours/myTour/:tour_id"
            element={<MyTourDetail />}
          ></Route>
          <Route
            path="/users/tours/:tour_id/:title/:day/addSite"
            element={<AddSiteToATour />}
          ></Route>
          <Route
            path="/users/tours/:tour_id/participants"
            element={<AddNewParticipant />}
          ></Route>
        </Route>

        <Route path="/" element={<Layout auth={auth} />}>
          {/* 處理 403 error 的頁面 */}
          <Route path="/noAuth" element={<NoAuth />}></Route>

          {/* 處理 404 error 的頁面 */}
          <Route path="*" element={<NotFound />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
