import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dev from "./pages/Dev";
import Lock from "./pages/Lock";

export default function App() {
  const [now, setNow] = useState(Date.now());
  const targetTs = Date.UTC(2026, 0, 12, 17, 0, 0);
  const unlocked = now >= targetTs;

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={unlocked ? <LandingPage /> : <Lock />} />
        <Route path="/dev" element={<Dev />}/>
      </Routes>
    </BrowserRouter>
  );
}
