import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Layout from "./components/Layout";
import HomeComponent from "./components/home-component";
import AppExample from "./AppExample";
import LoginComponent from "./components/login-component";
import Test from "./components/test";

function App() {
  let [currentUser, setCurrentUser] = useState("");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
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
          <Route path="test" element={<Test />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
