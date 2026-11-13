# React Chat App

A glassmorphism chat app built with React + Vite, with a Socket.io server (Express).

## Features
- Type a message and press **Send** (or Enter); it appears in the thread above the input
- Each message gets a random username from `["Alan", "Bob", "Carol", "Dean", "Elin"]`
- Like button on every message with a live count
- Emoji picker with search and skin-tone options
- `@` mentions (arrow keys / Enter / click) and a Socket.io server for real-time sync across tabs
- Light / dark mode, animations, responsive layout
- Works without the server too (falls back to local mode)

## Run
```bash
npm install
npm run start:all   # server (port 4000) + client
```
Or separately: `npm run server` and `npm run dev`.

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

Open two browser tabs to see real-time sync. Set `VITE_SOCKET_URL` to point at a deployed server.
