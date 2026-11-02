import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (
  <footer className="footer-main">
    <div className="footer-inner">
      <div><strong>SquadScript</strong><p>Build better, together.</p></div>
      <nav aria-label="Footer navigation"><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/privacy-policy">Privacy</Link><Link to="/tnc">Terms</Link></nav>
      <small>© {new Date().getFullYear()} SquadScript. All rights reserved.</small>
    </div>
  </footer>
);

export default Footer;
