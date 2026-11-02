# Project Initial Report

## Ayush Kumar Tripathi 12103634 and Mohak Tiwari 12108526

## Video Demo Link: https://drive.google.com/file/d/1ZwNJEN-NhAKc7PZczeI0pKAPm0vhXyGV/view?usp=sharing

### Project Name: SquadScript

- **Which problem Project is Solving?**
  - SquadScript is an innovative coding platform designed to foster collaborative learning and development. It allows up to four people to come together from anywhere in the world and code together while engaging in real-time conversation.

- **What are existing similar solutions?**
  - 1. **Visual Studio Code Live Share:**
    - *Similar Features:* Collaborative coding, chat, live editing.
  - 2. **CodePen:**
    - *Similar Features:* Online code editor, live output.
  - 3. **Zoom with Code Editor:**
    - *Similar Features:* Video calls with coding collaboration.

- **How do you want to solve it?**
  - SquadScript will provide an integrated platform with a focus on collaborative coding. It aims to enhance the coding experience by offering features like real-time code editing, video calls, chat, and additional tools such as a whiteboard for better collaboration.

- **List of features you want to implement:**
  - 1. **Collaborative Coding:**
    - Video calls for up to 4 participants.
    - Chat functionality for communication.
    - Dual code editor - personal and main.
  - 2. **Integration with GitHub:**
    - Seamless integration with GitHub for version control repositories management.
  - 3. **Live Output Panel:**
    - Real-time output for HTML, CSS, JS code.
  - 4. **User Management:**
    - Login and signup functionality.
    - User profile pages.
  - 5. **Code File Handling:**
    - Uploading code files to the code editor.
    - Multiple people editing the code simultaneously.
  - 6. **Editor Tabs:**
    - Opening multiple editor tabs together.
  - 7. **Recording and Saving:**
    - Recording collaborative coding sessions.
    - Saving recordings locally.
  - 8. **Whiteboard and Image Upload:**
    - Whiteboard for collaborative drawings and annotations.
    - Image uploading option for reference.
  - 9. **Light Mode and Dark Mode:**
    - Toggle between light and dark modes for user preference.
  - 10. **File Transfer:**
    - Ability to transfer files among participants.
  - 11. **Video Call for up to 4 people:**
    - Support for video calls with a maximum of 4 participants.
  - 12. **Multiple People Editing Simultaneously:**
    - Enabling multiple users to edit code simultaneously.
- 13. **Opening Multiple Editor Tabs Together:**
    - Feature to open and work on multiple editor tabs concurrently.
  - 14. **File Transfer Functionality:**
    - Implementation of file transfer capabilities among users.

## Production setup

1. Copy `Server/.env.example` to `Server/.env` and replace every placeholder used by your deployment.
2. Use a long, random `JWT_SECRET`, HTTPS, a restricted MongoDB user, and an explicit comma-separated `CLIENT_URL` allowlist.
3. Set `VIDEO_SDK_TOKEN` on the server. Never place VideoSDK or RapidAPI credentials in the React application.
4. Rotate the VideoSDK credential that existed in older frontend source history before deploying this version.
5. Build the client with `npm run build` and start the API with `npm start` from `Server`.

The API includes allowlisted CORS, hardened HTTP headers, bounded request bodies, authentication/OTP/compiler rate limits, Mongo-style input rejection, scoped password-reset tokens, HTTP-only session cookies, resource ownership checks, authenticated Socket.IO rooms, and upstream timeouts. Production tuning values are documented in `Server/.env.example`.
