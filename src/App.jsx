import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

const USER_LIST = ["Alan", "Bob", "Carol", "Dean", "Elin"];
const COLORS = {
  Alan: "#e5586b",
  Bob: "#e59a2f",
  Carol: "#2fb585",
  Dean: "#4f86f0",
  Elin: "#9a63f0",
  "Team Chat Bot": "#6b7390",
};
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
const MENTION_RE = new RegExp(`(@(?:${USER_LIST.join("|")})\\b)`, "g");

const pickUser = () => USER_LIST[Math.floor(Math.random() * USER_LIST.length)];
const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const initials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const WELCOME = {
  id: "welcome",
  user: "Team Chat Bot",
  text: "Welcome to Team Chat 👋 Send a message to start. Type @ to mention someone.",
  time: new Date().toISOString(),
  likes: 0,
};

function renderText(text) {
  return text.split(MENTION_RE).map((part, i) =>
    part.startsWith("@") && USER_LIST.includes(part.slice(1)) ? (
      <span key={i} className="mention">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function Message({ msg, onLike }) {
  return (
    <div className="msg">
      <div className="avatar" style={{ background: COLORS[msg.user] }}>{initials(msg.user)}</div>
      <div className="msg-body">
        <div className="msg-head">
          <span className="msg-user">{msg.user}</span>
          <span className="msg-time">{fmtTime(msg.time)}</span>
        </div>
        <div className="bubble">
          <p>{renderText(msg.text)}</p>
          <button
            className={`like ${msg.likes ? "liked" : ""}`}
            aria-label={`Like message from ${msg.user}. ${msg.likes} likes`}
            onClick={() => onLike(msg.id)}
          >
            <i className="fa-solid fa-thumbs-up" aria-hidden="true" />
            <span key={msg.likes} className="count">{msg.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [text, setText] = useState("");
  const [live, setLive] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [mention, setMention] = useState(null); // { query, start }
  const [mIndex, setMIndex] = useState(0);
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  const suggestions = mention
    ? USER_LIST.filter((user) => user.toLowerCase().startsWith(mention.query.toLowerCase()))
    : [];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // socket.io: subscribe to server events. If the server isn't running, the app works locally.
  useEffect(() => {
    const s = io(SOCKET_URL, { reconnectionAttempts: 3, timeout: 3000 });
    socketRef.current = s;
    s.on("connect", () => setLive(true));
    s.on("disconnect", () => setLive(false));
    s.on("connect_error", () => setLive(false));
    s.on("chat:history", (history) => setMessages(history));
    s.on("chat:message", (m) =>
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
    );
    s.on("chat:likes", ({ id, likes }) =>
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, likes } : m)))
    );
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    const user = pickUser(); // random user for every message
    if (live) {
      socketRef.current.emit("chat:message", { user, text: value });
    } else {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, user, text: value, time: new Date().toISOString(), likes: 0 },
      ]);
    }
    setText("");
    setMention(null);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const like = (id) => {
    if (live) socketRef.current.emit("chat:like", id);
    else setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m)));
  };

  const setCaret = (pos) =>
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
    });

  const handleChange = (e) => {
    const value = e.target.value;
    const caret = e.target.selectionStart;
    setText(value);
    const m = /(^|\s)@(\w*)$/.exec(value.slice(0, caret));
    if (m) {
      setMention({ query: m[2], start: caret - m[2].length - 1 });
      setMIndex(0);
    } else {
      setMention(null);
    }
  };

  const pickMention = (name) => {
    const caret = inputRef.current.selectionStart;
    const next = `${text.slice(0, mention.start)}@${name} ${text.slice(caret)}`;
    setText(next);
    setMention(null);
    setCaret(mention.start + name.length + 2);
  };

  const insertEmoji = (emoji) => {
    const el = inputRef.current;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    setText(text.slice(0, start) + emoji + text.slice(end));
    setCaret(start + emoji.length);
  };

  const handleKeyDown = (e) => {
    if (mention && suggestions.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMIndex((i) => (i + 1) % suggestions.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMIndex((i) => (i - 1 + suggestions.length) % suggestions.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pickMention(suggestions[mIndex]); return; }
      if (e.key === "Escape") { setMention(null); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <div className="bg" aria-hidden="true">
        <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
      </div>

      <div className="chat">
        <header className="chat-header">
          <div className="channel">
            <div className="hash">#</div>
            <div>
              <h1>Team Chat</h1>
              <p>
                <span className={`dot ${live ? "on" : ""}`} />
                {live ? "Live · connected to server" : "Local mode · server not connected"}
              </p>
            </div>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle light / dark mode"
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
          </button>
        </header>

        <div className="thread">
          {messages.map((m) => (
            <Message key={m.id} msg={m} onLike={like} />
          ))}
          <div ref={endRef} />
        </div>

        <div className="composer-wrap">
          {mention && suggestions.length > 0 && (
            <ul className="popover mentions" role="listbox">
              {suggestions.map((u, i) => (
                <li
                  key={u}
                  role="option"
                  aria-selected={i === mIndex}
                  className={i === mIndex ? "active" : ""}
                  onMouseDown={(e) => { e.preventDefault(); pickMention(u); }}
                  onMouseEnter={() => setMIndex(i)}
                >
                  <span className="avatar sm" style={{ background: COLORS[u] }}>{initials(u)}</span>
                  {u}
                </li>
              ))}
            </ul>
          )}

          {showEmoji && (
            <div className="emoji-picker-popover">
              <Suspense fallback={<div className="emoji-picker-loading">Loading emojis…</div>}>
                <EmojiPicker
                  onEmojiClick={({ emoji }) => insertEmoji(emoji)}
                  colorScheme={theme}
                  emojiStyle="native"
                  width="100%"
                  height={400}
                  previewConfig={{ showPreview: false }}
                />
              </Suspense>
            </div>
          )}

          <div className="composer">
            <input
              ref={inputRef}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type message… use @ to mention"
              autoFocus
            />
            <button
              className={`icon-btn ${showEmoji ? "active" : ""}`}
              onClick={() => setShowEmoji((v) => !v)}
              aria-label="Toggle emoji picker"
            >
              <i className="fa-regular fa-face-smile" />
            </button>
            <button className="send" onClick={send} disabled={!text.trim()} aria-label="Send message">
              <i className="fa-solid fa-paper-plane" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
