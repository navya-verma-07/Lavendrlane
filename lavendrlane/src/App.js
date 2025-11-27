import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./Home";
import Journal from "./Journal";
import Entries from "./Entries";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app-shell">
        <nav className="topbar">
          <Link to="/" className="brand">💜 Lavendrlane</Link>
          <div className="nav-right">
            <Link to="/journal" className="nav-btn">✍️ Journal</Link>
            <Link to="/entries" className="nav-btn">📚 My Entries</Link>
          </div>
        </nav>

        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/entries" element={<Entries />} />
          </Routes>
        </main>

        <footer className="footer">
          <small>crafted in lavender hues & quiet focus. 💫</small>
        </footer>
      </div>
    </Router>
  );
}
