import Navbar from '../component/Navbar';
import './Profile.css';
import Footer from '../component/Footer';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function Profile() {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [username, setusername] = useState("");
  const [isverified, setisverified] = useState("");
  const [edit, setedit] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setname(localStorage.getItem("name"));
    setusername(localStorage.getItem("username"));
    setemail(localStorage.getItem("email"));
    setisverified(localStorage.getItem("isVerified"));
  }, [])

  const handlelogout = async (e) => {
    try { await axios.post("/api/v1/auth/logout"); } catch (_) { /* Clear local state even if the session expired. */ }
    localStorage.setItem("auth", "");
    localStorage.setItem("name", "");
    localStorage.setItem("email", "");
    localStorage.setItem("username", "");
    localStorage.setItem("isVerified", "");
    toast.success('Logged Out', {
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
    navigate('/login');
  }

  const handleedit = (e) => {
    setedit(!edit);
  }
  const handlesave = async (e) => {
    setedit(!edit);
    const headers = {
      "Authorization": localStorage.getItem("auth")
    }
    const response = await axios.post("/api/v1/auth/islogin", {
      name, email, username
    }, { headers: headers })
    if (response.data.success) {
      localStorage.setItem("name", response.data.data[1]);
      localStorage.setItem("email", response.data.data[2]);
      localStorage.setItem("username", response.data.data[0]);
      localStorage.setItem("isVerified", response.data.data[3]);
      toast.success('User Details Updated successfully', {
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
    else {
      toast.error("Details updation failed. Try again or contact admin", {
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

  const handleInputChange = (e, setter) => {
    setter(e.target.innerText);
  };

  const handledelete = async (e) => {
    let conf = window.confirm('Are you sure to delete your account? This action cannot be reversed');
    if (conf) {
      const headers = {
        "Authorization": localStorage.getItem("auth")
      }
      console.log(headers);
      const response = await axios.post("/api/v1/auth/deleteuser", {}, { headers: headers });
      if (response.data.success) {
        toast.success('User Deleted successfully', {
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
        localStorage.setItem("auth", "");
        localStorage.setItem("name", "");
        localStorage.setItem("email", "");
        localStorage.setItem("username", "");
        localStorage.setItem("isVerified", "");
        navigate('/login');
      }
      else {
        toast.error('Failed to Delete User. Try again or contact admin', {
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

  const verifyuser = async (e) => {
    try {
      const headers = {
        "Authorization": localStorage.getItem("auth")
      }
      const response = await axios.post("/api/v1/auth/sendotp", { email }, { headers: headers });
      if (response.data.success) {
        const otp = prompt("Enter OTP");
        const res = await axios.post("/api/v1/auth/verifyotp", { email, otp }, { headers: headers });
        if (res.data.success) {
          localStorage.setItem("isVerified", "true");
          setisverified("true");
          console.log(isverified, res.data);
          toast.success('User Verification Successful', {
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
        else {
          toast.error('Failed to Verify User. Try again or contact admin', {
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
  const [show,setshow] = useState(false);
  const handleoption = () => {
    setshow(!show)
  }

  return (
    <>
      <Navbar />
      <div className='profile-main'>
        <div className='profile-content'>
          <table className='table m-5'>
            <tbody>
              <tr>
                <td><strong>Name:</strong></td>
                <td>{edit ? <span contentEditable onBlur={(e) => handleInputChange(e, setname)}>{name}</span> : name}</td>
              </tr>
              <tr>
                <td><strong>Username:</strong></td>
                <td>{edit ? <span contentEditable onBlur={(e) => handleInputChange(e, setusername)}>{username}</span> : username}</td>
              </tr>
              <tr>
                <td><strong>Email:</strong></td>
                <td>{edit ? <span contentEditable onBlur={(e) => handleInputChange(e, setemail)}>{email}</span> : email}</td>
              </tr>
              <tr>
                <td><strong>Verified:</strong></td>
                <td>
                  {isverified}
                  {isverified === "true" ? (
                    <button className='btn btn-dark ms-4' disabled>Verified</button>
                  ) : (
                    <button className='btn btn-dark ms-4' onClick={verifyuser}>Verify</button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
          <div className='edit-options'>
            {show?(
              <button className='btn btn-dark' onClick={handleoption}>Hide options</button>
            ):(
              <button className='btn btn-dark' onClick={handleoption}>Show more options</button>
            )}
          </div>
        </div>
      </div>
      {show?(
        <div className='profile-buttons mt-5'>
        <div className='buttons'>
          {edit ? (
            <button className='btn btn-dark' onClick={handlesave}>Save Details</button>
          ) : (
            <button className='btn btn-dark' onClick={handleedit}>Edit Details</button>
          )}
          <button className='btn btn-danger' onClick={handlelogout}>Logout</button>
          <button className='btn btn-danger' onClick={handledelete}>Delete Profile</button>
        </div>
      </div>
      ):""}
      <Footer />
    </>
  );
}

export default Profile;
