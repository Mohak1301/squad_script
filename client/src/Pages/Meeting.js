import React, { useEffect, useState } from 'react';
import './Meeting.css';
import Navbar from '../component/Navbar';
import Footer from '../component/Footer';
import { useParams } from 'react-router-dom';
const Meeting = () => {
  const params = useParams();
  const [id,setid] = useState({});
  useEffect(()=>{
    if (params?.meet_id) setid(params.meet_id);
  },[params?.meet_id]);
  console.log(id);
  return (
    <main className='meeting-main-section'>
    <Navbar />
    <h1>Meeting</h1>
    <Footer />
    </main>
  )
}

export default Meeting;