import React from "react";
import RaffleCTA from "./components/RaffleCTA";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="sidebar">
        <h3>Site Navigation</h3>
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#events">Events</a>
          </li>
        </ul>

        {/* Raffle CTA Widget */}
        <RaffleCTA />
      </div>

      {/* Main content area */}
      <div className="main-content">
        <h1>Welcome to CityLore</h1>
        <p>Your local city guide and community platform.</p>
        <p>
          Don't miss out on our monthly raffle - buy a €1 ticket for a chance to
          win amazing prizes!
        </p>
      </div>
    </div>
  );
}

export default App;
