import React, {} from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dev from "./pages/Dev";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dev" element={<Dev />}/>
      </Routes>
    </BrowserRouter>
  );
}
