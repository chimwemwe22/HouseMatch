import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import Footer from '../components/Footer';
import "./home.css";

const Home = () => {
  const { user, accessToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]); // <-- all users
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('location'); 
  const [modalHouse, setModalHouse] = useState(null);

  // Fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/listings/available/', {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        const data = await res.json();
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setListings([]);
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch('http://localhost:8000/auth/users/', {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
        });
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch users error:", err);
        setUsers([]);
      }
    };

    Promise.all([fetchListings(), fetchUsers()]).finally(() => setLoading(false));
  }, [accessToken]);

  const approvedListings = listings?.filter(house => house.status === "approved");

  const filteredListings = approvedListings.filter((house) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    switch (searchField) {
      case 'location': return house.location.toLowerCase().includes(query);
      case 'title': return house.title.toLowerCase().includes(query);
      case 'price': return house.price.toString().includes(query);
      case 'bedrooms': return house.bedrooms.toString().includes(query);
      case 'bathrooms': return house.bathrooms.toString().includes(query);
      default: return true;
    }
  });

  const handleChatWithLandlord = async (house) => {
    if (!user) return alert("Please login to start a chat");

    // find the landlord info
    const landlord = users.find(u => u.id === house.landlordId);
    if (!landlord) return alert("Landlord not found");

    if (user.id === landlord.id) {
      return alert("You cannot chat with yourself!");
    }

    const chatId = [user.id, landlord.id].sort().join("_");

    try {
      const res = await fetch('http://localhost:8000/sms/chats/', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ chatId }),
      });

      if (!res.ok) throw new Error("Failed to create chat");

      const chat = await res.json();

      // navigate to /chat and pass chatId in state
      navigate('/chat', { state: { chatId: chatId } });

    } catch (err) {
      console.error(err);
      alert("Error creating chat. Try again.");
    }
  };


  return (
    <main className="bg-clay text-slate font-sans min-h-screen">
      <Hero onSearch={setSearchQuery} onFilterChange={setSearchField} />

      {user && (
        <p className="welcome-msg">
          Welcome back, <strong>{user.username}</strong> — logged in as <strong>{user.role}</strong>.
        </p>
      )}

      <section className="section">
        <div className="container">
          <h2>Featured Listings</h2>

          {loading ? (
            <div className="loader">
              <div className="loader-spinner"></div>
              <p className="loader-text">Loading listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#1f2937' }}>
              No approved listings available.
            </p>
          ) : (
            <div className="listings-grid">
              {filteredListings.map((house) => (
                <div key={house.id} className="listing-card cursor-pointer">
                  {house.images?.length > 0 ? (
                    <img
                      src={house.images[0].image}
                      alt={house.title}
                      className="listing-main-image"
                      onClick={() => setModalHouse(house)}
                    />
                  ) : (
                    <div className="no-image" onClick={() => setModalHouse(house)}>No image available</div>
                  )}

                  <div className="card-content">
                    <h3>{house.title}</h3>
                    <p className="price">K {house.price}</p>
                    <p>{house.location}</p>
                    <p>{house.bedrooms} beds • {house.bathrooms} baths</p>
                    {house.furnished && <span className="furnished-badge">Furnished</span>}

                    <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                      {user?.role === 'landlord' && user.id === house.owner_id ? (
                        <span className="owner-badge">You are the owner of this post</span>
                      ) : (
                        <button
                          className="view-listing"
                          onClick={() => handleChatWithLandlord(house)}
                        >
                          Speak to Landlord <span role="img" aria-label="speech"></span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {modalHouse && (
        <div className="modal-overlay" onClick={() => setModalHouse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalHouse(null)}>&times;</button>

            <h2 className="modal-title">{modalHouse.title}</h2>
            <p className="modal-price">K {modalHouse.price}</p>
            <p className="modal-description">{modalHouse.description}</p>
            <p className="modal-location">{modalHouse.location}</p>
            <p className="modal-details">{modalHouse.bedrooms} beds • {modalHouse.bathrooms} baths</p>
            {modalHouse.furnished && <span className="furnished-badge modal-furnished">Furnished</span>}

            <div className="modal-images">
              {modalHouse.images?.length > 0 ? modalHouse.images.map((img, idx) => (
                <img key={idx} src={img.image} alt={`House ${idx+1}`} className="modal-image"/>
              )) : (
                <div>No images available</div>
              )}
            </div>
          </div>
        </div>
      )}

      <AboutSection />
      <Footer />
    </main>
  );
};

export default Home;
