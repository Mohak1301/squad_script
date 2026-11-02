import axios from "axios";

export const getVideoToken = async () => {
  const response = await axios.get("/api/v1/meet/token", {
    headers: { Authorization: localStorage.getItem("auth") },
  });
  return response.data.token;
};

export const createMeeting = async ({ token }) => {
  const response = await fetch("https://api.videosdk.live/v2/rooms", {
    method: "POST",
    headers: { authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error("Unable to create a video room");
  const { roomId } = await response.json();
  if (!roomId) throw new Error("Video service returned an invalid room");
  return roomId;
};
