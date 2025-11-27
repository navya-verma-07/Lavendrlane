import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="lavender-container">
      <h1>💜 welcome to lavendrlane 💜</h1>
      <p>a dreamy, purple-coded corner for your thoughts & moods 🌷</p>
      <Link to="/journal">
        <button className="start-btn">start journaling</button>
      </Link>
    </div>
  );
}

export default Home;
