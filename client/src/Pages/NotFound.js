import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";

const NotFound = () => <div style={{ minHeight: "100vh", background: "#040514", color: "#fff" }}><Navbar /><main style={{ minHeight: "620px", display: "grid", placeContent: "center", padding: "40px", textAlign: "center" }}><div><span style={{ color: "#4bc286", fontWeight: 800, letterSpacing: ".12em" }}>404</span><h1 style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", margin: "12px 0", letterSpacing: "-.05em" }}>Page not found</h1><p style={{ color: "#8992a5", marginBottom: "28px" }}>The page you’re looking for doesn’t exist or has moved.</p><Link className="button button-primary" to="/">Back to home</Link></div></main><Footer /></div>;

export default NotFound;
