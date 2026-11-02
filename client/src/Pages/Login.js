import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiLock, FiMail, FiUser } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import "./Login.css";

const Login = () => {
  const [mode, setMode] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [register, setRegister] = useState({ username: "", name: "", email: "", password: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.post("/api/v1/auth/islogin", {});
        if (response.data.success) navigate("/", { replace: true });
      } catch (_) { /* A missing session is expected on this page. */ }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/auth/login", login);
      localStorage.setItem("auth", "");
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("isVerified", String(data.user.isVerified));
      toast.success(data.message);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to sign in");
    } finally { setLoading(false); }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/auth/register", register);
      toast.success(data.message);
      setMode("signin");
      setLogin((current) => ({ ...current, email: register.email }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create account");
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-shell">
        <section className="auth-context">
          <div className="auth-badge"><span /> Secure collaboration workspace</div>
          <h1>Your team’s code,<br /><span>in perfect sync.</span></h1>
          <p>Join focused sessions where conversation, code, and execution happen together.</p>
          <ul><li><FiCheck /> End-to-end protected sessions</li><li><FiCheck /> Real-time editor and chat</li><li><FiCheck /> Built for teams of up to four</li></ul>
          <div className="auth-code-card"><div><i /><i /><i /></div><code><em>await</em> squad.connect(<strong>'secure-room'</strong>);<br /><span>{'// Ready to build together'}</span></code></div>
        </section>
        <section className="auth-card" aria-label={mode === "signin" ? "Sign in" : "Create account"}>
          <div className="auth-tabs"><button className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Create account</button></div>
          {mode === "signin" ? (
            <form onSubmit={handleLogin}>
              <div className="auth-heading"><span>Welcome back</span><h2>Sign in to SquadScript</h2><p>Continue to your collaboration workspace.</p></div>
              <label>Email address<div className="input-wrap"><FiMail /><input type="email" autoComplete="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} placeholder="you@company.com" /></div></label>
              <label>Password<div className="input-wrap"><FiLock /><input type="password" autoComplete="current-password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} placeholder="Your password" /></div></label>
              <Link className="forgot-link" to="/forgotpassword">Forgot password?</Link>
              <button className="auth-submit" disabled={loading}>{loading ? "Signing in…" : <>Sign in <FiArrowRight /></>}</button>
              <p className="auth-switch">New to SquadScript? <button type="button" onClick={() => setMode("register")}>Create an account</button></p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="auth-heading"><span>Start collaborating</span><h2>Create your account</h2><p>Set up your secure workspace in under a minute.</p></div>
              <div className="auth-row"><label>Full name<div className="input-wrap"><FiUser /><input type="text" autoComplete="name" required value={register.name} onChange={(e) => setRegister({ ...register, name: e.target.value })} placeholder="Your name" /></div></label><label>Username<div className="input-wrap"><FiUser /><input type="text" autoComplete="username" required value={register.username} onChange={(e) => setRegister({ ...register, username: e.target.value })} placeholder="username" /></div></label></div>
              <label>Email address<div className="input-wrap"><FiMail /><input type="email" autoComplete="email" required value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value })} placeholder="you@company.com" /></div></label>
              <label>Password<div className="input-wrap"><FiLock /><input type="password" autoComplete="new-password" minLength="8" required value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} placeholder="8+ chars, upper/lowercase and number" /></div></label>
              <button className="auth-submit" disabled={loading}>{loading ? "Creating account…" : <>Create account <FiArrowRight /></>}</button>
              <p className="auth-terms">By continuing, you agree to our <Link to="/tnc">Terms</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</p>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
