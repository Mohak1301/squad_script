import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiCode, FiFileText } from "react-icons/fi";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import "./File.css";

const FilesPage = () => {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await axios.get("/api/v1/file/files");
        setFiles(response.data.files || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load shared files");
      } finally { setLoading(false); }
    };
    getFiles();
  }, []);

  const openFile = async (file) => {
    try {
      const response = await axios.get(`/api/v1/file/files/${file.meetingid}`);
      setSelected(response.data.file);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to open this file");
    }
  };

  return (
    <div className="files-page">
      <Navbar />
      <main className="files-shell">
        <div className="files-heading"><span>Community snapshots</span><h1>Shared code</h1><p>Browse code snapshots that collaborators have chosen to make public.</p></div>
        {loading ? <div className="files-state">Loading snapshots…</div> : error ? <div className="files-state error">{error}</div> : files.length === 0 ? <div className="files-state"><FiFileText /> No public snapshots yet.</div> : (
          <div className="files-layout">
            <div className="files-list">{files.map((file) => <button key={file._id || file.meetingid} className={selected?.meetingid === file.meetingid ? "active" : ""} onClick={() => openFile(file)}><FiCode /><span><strong>{file.title}</strong><small>{file.language}</small></span></button>)}</div>
            <section className="file-viewer">{selected ? <><header><div><strong>{selected.title}</strong><span>{selected.language}</span></div><small>Room {selected.meetingid}</small></header><pre><code>{selected.content}</code></pre></> : <div className="file-placeholder"><FiCode /><p>Select a snapshot to inspect its code.</p></div>}</section>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FilesPage;
