import './App.css';
import Login from './Pages/Login';
import About from './Pages/About';
import Join from './Pages/Join';
import Profile from './Pages/Profile';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ForgotPassword from './Pages/ForgotPassword';
import TNC from './Pages/TNC';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import Contact from './Pages/Contact';
import Landing from './Pages/Landing';
import FilesPage from './Pages/File';
import { ToastContainer } from 'react-toastify';
import NotFound from './Pages/NotFound';

function App() {
  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/join" element={<Join />} />
      <Route path="/about" element={<About />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/tnc" element={<TNC />} />
      <Route path="/seefile" element={<FilesPage/>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </BrowserRouter>
    <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition="Bounce"
      />
    </>
    );
}

export default App;
