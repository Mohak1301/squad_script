import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";
import SSLogo from "../images/SquadScript.png";

function NavBar() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const location = useLocation();

  useEffect(() => setUsername(localStorage.getItem("username") || ""), [location.pathname]);
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Primary navigation">
        <div className="nav-container">
          <NavLink to="/" className="nav-logo" aria-label="SquadScript home">
            <img src={SSLogo} alt="SquadScript" />
          </NavLink>
          <button className="nav-icon" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="primary-menu" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <FiX /> : <FiMenu />}
          </button>
          <ul id="primary-menu" className={open ? "nav-menu active" : "nav-menu"}>
            <li><NavLink to="/" end className="nav-links">Home</NavLink></li>
            <li><NavLink to="/about" className="nav-links">About</NavLink></li>
            <li><NavLink to="/contact" className="nav-links">Contact</NavLink></li>
            <li><NavLink to="/join" className="nav-links nav-cta">Open workspace <FiArrowUpRight aria-hidden="true" /></NavLink></li>
            <li><NavLink to={username ? "/profile" : "/login"} className="nav-links nav-account">{username || "Sign in"}</NavLink></li>
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
