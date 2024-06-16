import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/pages/public/Layout.js";
import Home from "./components/pages/public/home.js";
import About from "./components/pages/public/about.js";
import SearchSites from "./components/pages/public/sites/search_sites.js";
import SiteDetail from "./components/pages/public/sites/siteDetail.js";
import SearchTours from "./components/pages/public/tours/search_tours.js";
import TourDetail from "./components/pages/public/tours/tourDetail.js";
import Login from "./components/pages/public/auth/login.js";
import Signup from "./components/pages/public/auth/signup.js";
import GoogleLogin from "./components/pages/public/auth/googleLogin.js";
import MyPageLayout from "./components/pages/users/MyPageLayout.js";
import MyProfile from "./components/pages/users/profile/myProfile.js";
import EditProfile from "./components/pages/users/profile/editProfile.js";
import EditPassword from "./components/pages/users/profile/editPassword.js";
import MySitesOverview from "./components/pages/users/site/mySitesOverview.js";
import MyCollectSites from "./components/pages/users/site/myCollectSites.js";
import MySiteDetail from "./components/pages/users/site/mySiteDetail.js";
import AddNewSite from "./components/pages/users/site/addNewSite.js";
import EditSite from "./components/pages/users/site/editSite.js";
import MyTours from "./components/pages/users/tour/myToursOverview.js";
import MyTourDetail from "./components/pages/users/tour/myTourDetail.js";
import MyApplied from "./components/pages/users/tour/myAppliedToursOverview.js";
import AddNewTour from "./components/pages/users/tour/addNewTour.js";
import AddSiteToATour from "./components/pages/users/tour/addSiteToATour.js";
import AddNewParticipant from "./components/pages/users/tour/addNewParticipant.js";
import AdminSearchUsers from "./components/pages/admin/search_users.js";
import AdminSearchSites from "./components/pages/admin/search_sites.js";
import AdminSiteDetail from "./components/pages/admin/siteDetail.js";
import AdminSearchTours from "./components/pages/admin/search_tours.js";
import AdminTourDetail from "./components/pages/admin/tourDetail.js";
import NoAuth from "./components/error/noAuth.js";
import NotFound from "./components/error/notFound.js";

function App() {
  let [auth, setAuth] = useState(JSON.parse(localStorage.getItem("auth"))); // 確認登入狀態
  let [currentUser, setCurrentUser] = useState(""); // 檢視使用者資料

  return (
    <BrowserRouter>
      <Routes>
        {/* 首頁 (不須登入即可瀏覽的頁面) */}
        <Route path="/" element={<Layout auth={auth} />}>
          <Route index element={<Home auth={auth} />}></Route>
          <Route path="/about" element={<About />}></Route>
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
            element={<MySitesOverview />}
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

        {/* 後台 */}
        <Route path="/admin" element={<Layout auth={auth} />}>
          <Route path="/admin/users" element={<AdminSearchUsers />}></Route>
          <Route path="/admin/sites" element={<AdminSearchSites />}></Route>
          <Route
            path="/admin/site/:site_id"
            element={<AdminSiteDetail />}
          ></Route>
          <Route path="/admin/tours" element={<AdminSearchTours />}></Route>
          <Route
            path="/admin/tour/:tour_id"
            element={<AdminTourDetail />}
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
