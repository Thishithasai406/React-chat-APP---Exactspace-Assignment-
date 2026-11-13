# React Chat App

A glassmorphism-based real-time chat application built using **React + Vite**, with a **Socket.io server powered by Express.js**.

**Live Demo:** https://react-chat-app-exactspace-assignment.netlify.app/

## Features

- **Real-Time Messaging:** Type a message and press **Send** or Enter to display it in the chat thread.
- **Random Usernames:** Each message is assigned a random username from `["Alan", "Bob", "Carol", "Dean", "Elin"]`.
- **Like Messages:** Like button on every message with a live like count.
- **Emoji Picker:** Emoji selection with search functionality and skin-tone options.
- **@ Mentions:** Mention users using `@` with keyboard navigation (arrow keys and Enter) or mouse clicks.
- **Real-Time Synchronization:** Socket.io enables instant message synchronization across multiple browser tabs.
- **Light & Dark Mode:** Switch between light and dark themes.
- **Responsive Design:** Optimized for different screen sizes with smooth animations.
- **Local Mode Support:** Works without the Socket.io server by automatically falling back to local mode.


## Tech Stack

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Real-Time Communication:** Socket.io
- **Styling:** CSS (Glassmorphism)
- **Deployment:** Netlify (Frontend)


## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Application

Run both the frontend and backend simultaneously:

```bash
npm run start:all
```

Alternatively, start them separately:

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run dev
```

## Local URLs

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000

## Testing Real-Time Communication

1. Start the application using `npm run start:all`.
2. Open the application in two separate browser tabs.
3. Send a message from one tab.
4. Verify that the message appears instantly in the other tab.

**Note:** Set the `VITE_SOCKET_URL` environment variable to connect the frontend to a deployed Socket.io server.

---

