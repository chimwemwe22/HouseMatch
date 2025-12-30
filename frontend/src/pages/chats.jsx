import { useState, useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "./chatlist.css";

const Chat = () => {
  const { accessToken, user } = useContext(AuthContext);
  const location = useLocation();
  const { chatId } = location.state || {};
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(scrollToBottom, [messages]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8000/auth/users/', {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        const data = await res.json();
        // console.log(data);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch users error:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [accessToken]);

    useEffect(() => {
        if (!chatId) return;

        const fetchMessages = async () => {
            try {
            const res = await fetch(`http://localhost:8000/sms/messages/?chatId=${chatId}`, {
                headers: {
                "Content-Type": "application/json",
                ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                },
            });
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
            } catch (err) {
            console.error("Fetch messages error:", err);
            setMessages([]);
            }
        };

        // Fetch immediately once
        fetchMessages();

        // Set interval to fetch every 5 seconds
        const interval = setInterval(fetchMessages, 5000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [chatId, accessToken]);

  // Handle sending new message
  const handleSendMessage = async () => {
    console.log(chatId);
    if (!newMessage.trim()) return;

    try {
      const res = await fetch('http://localhost:8000/sms/messages/send/', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          chatId: chatId,
          content: newMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const msg = await res.json();
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
      alert("Error sending message");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserById = (id) => users.find(u => u.id === id);

  return (
    <div className="chat-container">
      {/* <div className="chat-header">
        <h2>Chat</h2>
      </div> */}

      <div className="chat-messages">
        {messages.map((msg) => {
          const sender = getUserById(msg.senderId);
          const isMine = msg.senderId === user.id;

          return (
            <div key={msg.id} className={`chat-message ${isMine ? 'mine' : 'other'}`}>
              {!isMine && <strong>{sender?.username || 'Unknown'}:</strong>}
              <p>{msg.content}</p>
              <span className="chat-time">{formatTime(msg.created_at)}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
