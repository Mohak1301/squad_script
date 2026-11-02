import axios from 'axios';
import Footer from '../component/Footer';
import Navbar from '../component/Navbar';
import './Join.css';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
} from "@videosdk.live/react-sdk";
import { createMeeting, getVideoToken } from "./VC/API";
import ReactPlayer from "react-player";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { FaMicrophone, FaPhoneSlash } from "react-icons/fa";
import Compiler from '../component/Compiler';
import Chat from '../component/Chat';
import { io } from "socket.io-client";
import gif from '../images/230700872-d5f44b85-56c7-4e27-80a4-6e2db901e60c.gif'

function JoinScreen({ getMeetingAndToken }) {
  const [meetid, setmeetid] = useState("");
  const checkislogin = async () => {
    try {
      const headers = {
        "authorization": localStorage.getItem("auth")
      }
      const check = await axios.post("/api/v1/auth/islogin", {
        name: localStorage.getItem("name"),
        email: localStorage.getItem("email"),
        username: localStorage.getItem("usernmae"),
      }, { headers: headers });
      console.log(check.data.success, check);
      return check.data.success;
    } catch (_) {
      return false;
    }
  }

  useEffect(() => {
    checkislogin();
  }, [])
  const navigate = useNavigate();
  const join = async (e) => {
    e.preventDefault();
    const loggedIn = await checkislogin();
    if (!loggedIn) {
      toast.info('To join a meet, user must be logged in', {
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
    }
    else {
      console.log(meetid)
      if (!meetid.trim()) {
        toast.error('Meeting ID is required', {
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
          await getMeetingAndToken(meetid);
        // const response = await axios.post(`/api/v1/meet/joinmeet/${meetid}`, {}, { headers: headers });
      }
    }
  }
  const create = async (e) => {
    e.preventDefault();
    const loggedIn = await checkislogin();
    if (!loggedIn) {
      toast.info('User must be logged in to create a meeting', {
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
      return;
    }
    await getMeetingAndToken(null);
    // const response = await axios.post("/api/v1/meet/createmeet", {}, { headers: headers });
  }
  return (
    <div className='meet-join'>
      <form className='join-meet'>
        <input className='form-control w-50' aria-label="Meeting ID" autoComplete="off" placeholder='Enter meeting ID' value={meetid} onChange={(e) => { setmeetid(e.target.value) }} />
        <button className='btn join-button' onClick={join}>Join</button>
      </form>
      <form className='create-meet'>
        <button className='btn create-button w-50' onClick={create}>Create a new meeting</button>
      </form>
    </div>
  );
}

function ParticipantView(props) {
  const micRef = useRef(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div className='video' style={{"height":"200px","width":"200px"}}>
      {/* <p>
        Participant: {displayName} | {webcamOn ? <HiMiniVideoCamera /> : <HiMiniVideoCameraSlash />} | Mic:{" "}
        {micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
      </p> */}
      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
      {webcamOn ? (
        <ReactPlayer
          //
          playsinline // extremely crucial prop
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          //
          url={videoStream}
          //
          height={"200px"}
          width={"200px"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      ):(
<div className='align-items-center'>
<p className='text-light'>{displayName}</p>

  </div>      )}
    </div>
  );
}

function Controls() {
  const { leave, toggleMic, toggleWebcam } = useMeeting();
  return (
    <div className='meet-controls d-flex justify-content-center  pt-4'>
      <button className='btn btn-dark' onClick={() => toggleMic()}><FaMicrophone /></button>
      <button className='btn btn-dark ms-3' onClick={() => toggleWebcam()}><HiMiniVideoCamera /></button>
      <button className='btn btn-danger ms-3' onClick={() => leave()}><FaPhoneSlash /></button>
    </div>
  );
}

function MeetingView(props) {
  const [joined, setJoined] = useState(null);

  //Get the method which will be used to join the meeting.
  //We will also get the participants list to display all participants
  const { join, participants } = useMeeting({
    //callback for when meeting is joined successfully
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    //callback for when meeting is left
    onMeetingLeft: () => {
      props.onMeetingLeave();
    },
  });

  const joinMeeting = () => {
    setJoined("JOINING");
    join();
  };

  const room = props.meetingId;
  const editorwidth = '100%';

  const [fileContent, setFileContent] = useState("");
  const [messages, setMessages] = useState([]);

  const socketRef = useRef();

  const fun1 = (value) => {
    if (socketRef.current) {
      socketRef.current.emit('code', { room, text: value });
    }
  }

  const sendMessage = (message) => {
    const username = localStorage.getItem('username');
    socketRef.current.emit('message', { room, text: message, username });
  };

  useEffect(()=>{
    const serverurl = process.env.REACT_APP_SERVER_URL || (process.env.NODE_ENV === "development" ? "http://localhost:5000" : window.location.origin);
    socketRef.current = io.connect(serverurl, {
      auth: { token: localStorage.getItem("auth") },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketRef.current.on('connect_error', (error) => {
      toast.error(error.message || "Unable to connect to the collaboration service");
    });

    socketRef.current.emit('join room', room);

    socketRef.current.on('code', (text) => {
      setFileContent(text);
    });

    socketRef.current.on('message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [room]);

  return (
    <>
       <div className=" vc-main d-flex align-items-center">
        <div className='heading-meet'> <h3 className='small-h3 text-light '>Meeting Id: {props.meetingId}</h3></div>
     
      {joined && joined === "JOINED" ? (
        <div className='video-vc m-0' >
          
          
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              participantId={participantId}
              key={participantId}
            />
          ))}
          
        </div>
      ) : joined && joined === "JOINING" ? (
        <p className='text-light'>Joining the meeting...</p>
      ) : (
        <button className='btn btn-dark' onClick={joinMeeting}>Join</button>
      )}
    </div>
    
    {/* Render Compiler and Controls only when meeting is joined */}
    {joined && joined === "JOINED" && (
      <div className='join-page'>
        <div className="compiler-side">
          <Compiler socketRef={socketRef} fun={fun1} FileContent={fileContent} room={room} width={editorwidth} />
        </div>
        <div className='chat-side'>
          <Chat messages={messages} sendMessage={sendMessage} />
        </div>
      </div>
    )}
   
    {joined && joined === "JOINED" && <Controls />}
    </>
  );
}


const Join = () => {
  const [meetingId, setMeetingId] = useState(null);
  const [videoToken, setVideoToken] = useState("");
  const [username, setUsername] = useState("");

  useEffect(()=>{
    setUsername(localStorage.getItem("username"));
  },[])

  //Getting the meeting id by calling the api we just wrote
  const getMeetingAndToken = async (id) => {
    try {
      const token = await getVideoToken();
      const nextMeetingId = id == null ? await createMeeting({ token }) : id.trim();
      setVideoToken(token);
      setMeetingId(nextMeetingId);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Unable to start the meeting");
    }
  };

  //This will set Meeting Id to null when meeting is left or ended
  const onMeetingLeave = () => {
    setMeetingId(null);
  };

  return videoToken && meetingId ? (
    <>
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: true,
          name: username,
        }}
        token={videoToken}
      >
        <MeetingView meetingId={meetingId} onMeetingLeave={onMeetingLeave} />
      </MeetingProvider>
      </>
      ) : (
        <>
        <Navbar />
        <div className='join-main'>
        <div className='join-content'>
          <div className='left-container'>
            <div className='left-heading w-75'>
              <h1>Connect,Indulge and Develop</h1>
            </div>
            <div className='left-content w-50'>
              <p>Our enhanced premium group project meeting platform, originally designed for secure business engagements as Squad Script, is now available to a broader audience at no cost.</p>
            </div>
            <JoinScreen getMeetingAndToken={getMeetingAndToken} />
          </div>
          <div className='right-container ms-5 p-0' style={{"objectFit":"contain"}}>
            <img src={gif} alt='' style={{"position":"relative","right":"190px","top":"15px"}}></img>
          </div>
        </div>
      </div>
      <Footer />
        </>
      );
}

export default Join;
