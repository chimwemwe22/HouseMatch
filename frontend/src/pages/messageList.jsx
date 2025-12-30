import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "./chats.css";

const ChatsList = () => {
  const { accessToken, user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState({});
  const navigate = useNavigate();

  // Fetch all users for displaying names
  useEffect(() => {
    if (!accessToken) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8000/auth/users/', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch users error:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [accessToken]);

    // Fetch all chats for the logged-in user
    useEffect(() => {
        if (!user || !accessToken) return;

        const fetchChats = async () => {
            try {
            const res = await fetch('http://localhost:8000/sms/chatsLists/', {
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await res.json();
            console.log("All chats:", data);

            // Map userId1 and userId2 for easier handling
            const mappedChats = data.map(chat => {
                const [userId1, userId2] = chat.chat_id.split("_").map(id => parseInt(id));
                return { ...chat, userId1, userId2 };
            });

            // Filter chats where current user is a participant
            const userChats = mappedChats.filter(
                chat => chat.userId1 === Number(user.id) || chat.userId2 === Number(user.id)
            );

            console.log("User chats:", userChats);
            setChats(userChats);
            } catch (err) {
            console.error("Fetch chats error:", err);
            setChats([]);
            }
        };

        fetchChats();
    }, [user, accessToken]);

  // Fetch last message for each chat every 5 seconds
  useEffect(() => {
    if (!accessToken) return;

    const fetchMessagesForChat = async (chatId) => {
      try {
        const res = await fetch(`http://localhost:8000/sms/messages/?chatId=${chatId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await res.json();
        setMessages(prev => ({ ...prev, [chatId]: Array.isArray(data) ? data[data.length - 1] : null }));
      } catch (err) {
        console.error(`Fetch messages for chat ${chatId} error:`, err);
        setMessages(prev => ({ ...prev, [chatId]: null }));
      }
    };

    // Fetch messages immediately and start interval
    chats.forEach(chat => fetchMessagesForChat(chat.chat_id));
    const interval = setInterval(() => {
      chats.forEach(chat => fetchMessagesForChat(chat.chat_id));
    }, 5000);

    return () => clearInterval(interval);
  }, [chats, accessToken]);

  // Get the other participant's username
  const getOtherUserName = (chat) => {
    const otherId = chat.userId1 === user.id ? chat.userId2 : chat.userId1;
    const otherUser = users.find(u => u.id === otherId);
    return otherUser ? otherUser.username : 'Unknown';
  };

  const handleChatClick = (chat) => {
    navigate('/chat', { state: { chatId: chat.chat_id } });
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="chats-list">
      {chats.length === 0 ? (
        <p>No chats found</p>
      ) : (
        chats.map(chat => {
          const lastMessage = messages[chat.chat_id];
          return (
            <div key={chat.id} className="chat-item" onClick={() => handleChatClick(chat)}>
              <strong>{getOtherUserName(chat)}</strong>
              <p>{lastMessage ? `${lastMessage.senderName}: ${lastMessage.content}` : 'No messages yet'}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatsList;
