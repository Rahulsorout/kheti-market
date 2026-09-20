import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getMessages, sendMessage } from "../services/chatService";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

/*
 * Get MongoDB user ID regardless of how
 * the backend sends the sender.
 */
function getUserId(value) {
  if (!value) return "";

  // Populated MongoDB object
  if (typeof value === "object") {
    return String(
      value._id ||
      value.id ||
      value.userId ||
      ""
    );
  }

  // Raw ObjectId / string
  return String(value);
}

export default function ChatBox({ contractId }) {
  const { token, user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /*
   * Current logged-in user's ID.
   *
   * Handles:
   * user._id
   * user.id
   * user.userId
   */
  const currentUserId = getUserId(user);

  // =========================================================
  // FETCH MESSAGES
  // =========================================================

  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        setError("");

        const response = await getMessages(
          contractId,
          token
        );

        const data = response?.data?.data;

        setMessages(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        console.error(
          "Failed to fetch messages:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load messages. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    if (contractId && token) {
      fetchMessages();
    }
  }, [contractId, token]);

  // =========================================================
  // SOCKET.IO
  // =========================================================

  useEffect(() => {
    if (!contractId || !token) return;

    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log(
        "Chat socket connected:",
        socket.id
      );

      setSocketConnected(true);

      socket.emit(
        "joinContract",
        contractId
      );
    });

    socket.on("disconnect", () => {
      console.log(
        "Chat socket disconnected"
      );

      setSocketConnected(false);
    });

    socket.on("newMessage", (newMessage) => {
      console.log(
        "New chat message:",
        newMessage
      );

      setMessages((prev) => {
        const exists = prev.some(
          (msg) =>
            String(msg._id) ===
            String(newMessage._id)
        );

        if (exists) {
          return prev;
        }

        return [...prev, newMessage];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [contractId, token]);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  async function handleSendMessage(e) {
    e.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError("");

      await sendMessage(
        contractId,
        trimmedMessage,
        token
      );

      setMessage("");

      inputRef.current?.focus();

      /*
       * Do NOT add the message manually.
       *
       * Backend Socket.IO will send newMessage.
       */
    } catch (err) {
      console.error(
        "Failed to send message:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  // =========================================================
  // ENTER TO SEND
  // SHIFT + ENTER = NEW LINE
  // =========================================================

  function handleKeyDown(e) {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      handleSendMessage(e);
    }
  }

  // =========================================================
  // FORMAT TIME
  // =========================================================

  function formatTime(date) {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // =========================================================
  // FORMAT DATE
  // =========================================================

  function formatDate(date) {
    if (!date) return "";

    const messageDate =
      new Date(date);

    const today = new Date();

    if (
      messageDate.toDateString() ===
      today.toDateString()
    ) {
      return "Today";
    }

    return messageDate.toLocaleDateString(
      [],
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // =========================================================
  // DATE SEPARATOR
  // =========================================================

  function shouldShowDate(index) {
    if (index === 0) {
      return true;
    }

    const current = new Date(
      messages[index]?.createdAt
    );

    const previous = new Date(
      messages[index - 1]?.createdAt
    );

    return (
      current.toDateString() !==
      previous.toDateString()
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="chatbox">

        <div className="chatbox-loading">

          <div className="chatbox-loading-header">

            <div className="chatbox-skeleton avatar" />

            <div>
              <div className="chatbox-skeleton title" />
              <div className="chatbox-skeleton subtitle" />
            </div>

          </div>

          <div className="chatbox-loading-messages">

            <div className="chatbox-skeleton bubble left" />

            <div className="chatbox-skeleton bubble right" />

            <div className="chatbox-skeleton bubble left small" />

            <div className="chatbox-skeleton bubble right" />

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="chatbox">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="chatbox-header">

        <div className="chatbox-person">

          <div className="chatbox-avatar">
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="chatbox-person-info">

            <h3>
              Contract Conversation
            </h3>

            <div className="chatbox-online">

              <span
                className={
                  socketConnected
                    ? "chatbox-online-dot active"
                    : "chatbox-online-dot"
                }
              />

              {socketConnected
                ? "Live conversation"
                : "Connecting..."}

            </div>

          </div>

        </div>

        <div className="chatbox-header-meta">

          {messages.length}{" "}

          {messages.length === 1
            ? "message"
            : "messages"}

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="chatbox-error">

          <span>⚠</span>

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      <div className="chatbox-messages">

        {messages.length === 0 ? (

          <div className="chatbox-empty">

            <div className="chatbox-empty-icon">
              💬
            </div>

            <h3>
              No messages yet
            </h3>

            <p>
              Start the conversation
              about this contract.
            </p>

          </div>

        ) : (

          messages.map(
            (msg, index) => {

              /*
               * IMPORTANT:
               *
               * Convert BOTH IDs to strings.
               *
               * This works when:
               *
               * msg.sender = "abc123"
               *
               * OR
               *
               * msg.sender = {
               *   _id: "abc123",
               *   name: "Rahul"
               * }
               */

              const senderId =
                getUserId(
                  msg.sender
                );

              const isMine =
                senderId !== "" &&
                currentUserId !== "" &&
                senderId ===
                  currentUserId;

              return (
                <div
                  key={
                    msg._id ||
                    `${msg.createdAt}-${index}`
                  }
                >

                  {/* DATE */}

                  {shouldShowDate(
                    index
                  ) && (

                    <div className="chatbox-date">

                      <span>
                        {formatDate(
                          msg.createdAt
                        )}
                      </span>

                    </div>
                  )}

                  {/* =================================================
                      MESSAGE ROW

                      mine   -> RIGHT
                      theirs -> LEFT
                      ================================================= */}

                  <div
                    className={`chatbox-message-row ${
                      isMine
                        ? "mine"
                        : "theirs"
                    }`}
                  >

                    {/* OTHER USER AVATAR */}

                    {!isMine && (

                      <div className="chatbox-message-avatar">

                        {typeof msg.sender ===
                        "object"
                          ? msg.sender?.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                            "U"
                          : "U"}

                      </div>

                    )}

                    {/* MESSAGE BUBBLE */}

                    <div
                      className={`chatbox-bubble ${
                        isMine
                          ? "chatbox-bubble-mine"
                          : "chatbox-bubble-theirs"
                      }`}
                    >

                      {/* SENDER NAME */}

                      {!isMine && (

                        <div className="chatbox-sender-name">

                          {typeof msg.sender ===
                          "object"
                            ? msg.sender?.name ||
                              "User"
                            : "User"}

                        </div>

                      )}

                      {/* MESSAGE */}

                      <div className="chatbox-message-text">

                        {msg.message}

                      </div>

                      {/* TIME */}

                      <div className="chatbox-message-meta">

                        <span>
                          {formatTime(
                            msg.createdAt
                          )}
                        </span>

                        {/* OWN MESSAGE */}

                        {isMine && (

                          <span className="chatbox-check">
                            ✓✓
                          </span>

                        )}

                      </div>

                    </div>

                  </div>

                </div>
              );
            }
          )

        )}

        <div
          ref={messagesEndRef}
        />

      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <form
        className="chatbox-input-area"
        onSubmit={
          handleSendMessage
        }
      >

        <div className="chatbox-input-wrapper">

          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Type a message..."
            maxLength={1000}
            rows={1}
            disabled={sending}
          />

          <span className="chatbox-character-count">

            {message.length}/1000

          </span>

        </div>

        <button
          type="submit"
          className="chatbox-send"
          disabled={
            !message.trim() ||
            sending
          }
        >

          {sending ? (

            <span className="chatbox-spinner" />

          ) : (

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >

              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

            </svg>

          )}

        </button>

      </form>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="chatbox-footer">

        <span>
          🔒 Messages are private to this contract
        </span>

        <span>
          Enter to send • Shift + Enter for new line
        </span>

      </div>

    </div>
  );
}