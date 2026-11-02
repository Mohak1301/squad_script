import React, { useState } from 'react'
import Navbar from '../component/Navbar';
import Footer from '../component/Footer';
import "./FogotPassword.css";
import axios from 'axios';
import { Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
const ForgotPassword = () => {
    const [verified, setverified] = useState(false);
    const [email, setemail] = useState("");
    const [otp, setotp] = useState("");
    const [otpverify, setotpverify] = useState(false);
    const [newpassword, setnewpassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const navigate = useNavigate();
    const handleforgotemail = (e) => {
        setemail(e.target.value);
    }
    const handleforgototp = (e) => {
        setotp(e.target.value);
    }
    const handleforgotpassword = (e) => {
        setnewpassword(e.target.value)
    }
    const headers = {
        "authorization":localStorage.getItem("auth")
    }
    const handleoptenter = async (e) => {
        e.preventDefault();
        if (!verified) {
            try {
                const response = await axios.post("/api/v1/auth/forgotpassword", {
                    email
                },{headers:headers});
                const otpsend = response.data;
                setverified(otpsend.success);
                toast.info(`${response.data.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
            } catch (error) {
                toast.error(`${error.response.data.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
            }
        }
        else if (verified && !otpverify) {
            try {
                const response = await axios.post("/api/v1/auth/verifyotp", {
                    email,
                    otp
                },{headers:headers});
                const otpcheck = response.data;
                setotpverify(otpcheck.success);
                setResetToken(otpcheck.resetToken || "");
                toast.success(`${response.data.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
            }
            catch (error) {
                toast.error(error.response?.data?.message || "Unable to verify the code", {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
            }
        }
        else if (verified && otpverify) {
            try {
                const response = await axios.post("/api/v1/auth/recievepassword/true", {
                    email, password: newpassword, resetToken
                });
                const result = response.data;
                toast.success(`${result.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
                navigate("/login");

            } catch (error) {
                toast.error(`${error.response.data.message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                    transition: Bounce,
                });
            }
        }
    }

    return (
        <>
            <Navbar />
            <div className='forgotpassward_main'>
                <div className='forgotpassward_background'>
                    <h1 className="text-center my-5">Forgot Password</h1>
                    <form className='forgotform'>
                        {verified ? (
                            otpverify ? (
                                <>
                                    <input className='form-control forgotemail my-3' type="email" value={email} disabled />
                                    <input className='form-control otp my-3' value={otp} disabled />
                                    <input className='form-control otp my-3' type="password" autoComplete="new-password" placeholder='Enter New Password' value={newpassword} onChange={handleforgotpassword} />
                                </>
                            ) : (
                                <>
                                    <input className='form-control forgotemail my-3' type="email" value={email} disabled />
                                    <input className='form-control otp my-3' inputMode="numeric" autoComplete="one-time-code" placeholder='Enter OTP' value={otp} onChange={handleforgototp} />
                                </>
                            )
                        ) : (
                            <input className='form-control forgotemail' type="email" autoComplete="email" placeholder='Enter email' value={email} onChange={handleforgotemail} />
                        )}
                    </form>
                    <div className='forgotsubmit'>
                        <button className='btn btn-dark mt-5' onClick={handleoptenter}>Submit</button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ForgotPassword
