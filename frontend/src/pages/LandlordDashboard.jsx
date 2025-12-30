import React, { useEffect, useState, useContext } from 'react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './dashboard.css';

const LandlordDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [update, setUpdate] = useState(0);
  const { user, accessToken } = useContext(AuthContext);

  const [listingModalOpen, setListingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    furnished: false,
    description: '',
  });

  // Fetch listings
  useEffect(() => {
    if (!user) return;

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    fetch('http://localhost:8000/api/listings/available/', {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    })
      .then(res => res.json())
      .then(data => {
        const landlordListings = data.filter(house => house.landlordId === user.id);
        setListings(landlordListings);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch listings:', err);
        setError('Failed to fetch listings.');
        setLoading(false);
      });
  }, [user]);

  // Fetch profile
  useEffect(() => {
    if (!user) return;

    fetch('http://localhost:8000/auth/profile/', {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setProfileForm({
          username: data.username || '',
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
        setProfileImage(data.profile_image || null); // Assuming backend returns profile_image URL
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
      });
  }, [user, accessToken, update]);

  const handleDelete = async (houseId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/listings/${houseId}/delete/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({ landlordId: user.id }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete listing");

      setListings(listings.filter((l) => l.id !== houseId));
      toast.success("Listing deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete listing.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUpdateClick = (house) => {
    setSelectedListing(house);
    setFormData({
      title: house.title,
      price: house.price,
      location: house.location,
      bedrooms: house.bedrooms,
      bathrooms: house.bathrooms,
      furnished: house.furnished,
      description: house.description,
    });
    setListingModalOpen(true);
  };

  const handleListingModalClose = () => {
    setListingModalOpen(false);
    setSelectedListing(null);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedListing) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/listings/${selectedListing.id}/update/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Failed to update listing");

      const updatedListing = await res.json();
      setListings(
        listings.map((l) => (l.id === selectedListing.id ? updatedListing : l))
      );
      toast.success("Listing updated successfully!");
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update listing.");
    }
  };


  if (!user) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>User data missing. Please log in again.</p>
      </div>
    );
  }

  // Tab change
  const handleTabChange = (tab) => setActiveTab(tab);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async () => {
    try {
      const res = await fetch('http://localhost:8000/auth/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile.');
    }
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    try {
      const formData = new FormData();
      formData.append('profile_image', profileImage);

      const res = await fetch('http://localhost:8000/auth/profile/upload-image/', {
        method: 'POST',
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload profile image');

      const data = await res.json();
      setProfile(data);
      setUpdate(prev => prev + 1);
      toast.success('Profile image updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload profile image.');
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-header">Welcome, {user.username}!</h1>

      {/* Profile section above tabs */}
      {profile && (
        <div className="profile-section">
          <img
            src={profile.profile_image || '/default-profile.png'}
            alt="Profile"
            className="profile-image"
          />
          {/* Username and email */}
          <div className="profile-details">
            <p><strong>{profile.username}</strong></p>
            <p>{profile.email}</p>
          </div>
          {/* Update Image directly under profile */}
          <div className="profile-image-update">
            <input type="file" onChange={handleImageChange} />
            <button onClick={handleImageUpload}>Update Image</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === 'posts' ? 'active' : ''} onClick={() => handleTabChange('posts')}>Posts</button>
        <button className={activeTab === 'about' ? 'active' : ''} onClick={() => handleTabChange('about')}>About</button>
      </div>

      {activeTab === 'posts' && (
        <>
          <p className="dashboard-subheader">
            You have <strong>{listings.length}</strong> listing{listings.length !== 1 && 's'}.
          </p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div className="loader-spinner"></div>
            </div>
          ) : listings.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>You have no listings yet.</p>
          ) : (
            <div className="listings-grid">
              {listings.map(house => (
                <div key={house.id} className="listing-card">
                  {house.images?.length > 0 ? <img src={house.images[0].image} alt={house.title} /> : <div className="no-image">No image available</div>}
                  <div>
                    <h2>{house.title}</h2>
                    <p>Price: K {house.price}</p>
                    <p>Location: {house.location}</p>
                    <p>{house.bedrooms} beds • {house.bathrooms} baths</p>
                    {house.furnished && <span className="badge green">Furnished</span>}
                    <span className={`badge ${house.status === 'approved' ? 'green' : house.status === 'pending' ? 'yellow' : 'red'}`}>
                      {house.status}
                    </span>
                    
                  </div>
                  <div className="listing-actions">
                      <button className="update" onClick={() => handleUpdateClick(house)}>Update</button>
                      <button className="delete" onClick={() => handleDelete(house.id)}>Delete</button>
                    </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'about' && profile && (
        <div className="about-tab">
          <h2>Your Profile</h2>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>First Name:</strong> {profile.first_name}</p>
          <p><strong>Last Name:</strong> {profile.last_name}</p>

          <button className="update-btn" onClick={() => setModalOpen(true)}>Update Profile</button>

          {/* Modal */}
          {modalOpen && (
            <div className="modal-overlay" onClick={() => setModalOpen(false)}>
              <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
              >
                <h3>Update Profile</h3>
                <input type="text" name="username" placeholder="Username" value={profileForm.username} onChange={handleProfileChange} />
                <input type="email" name="email" placeholder="Email" value={profileForm.email} onChange={handleProfileChange} />
                <input type="text" name="first_name" placeholder="First Name" value={profileForm.first_name} onChange={handleProfileChange} />
                <input type="text" name="last_name" placeholder="Last Name" value={profileForm.last_name} onChange={handleProfileChange} />
                <div className="modal-buttons">
                  <button className="cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button className="save" onClick={handleProfileSubmit}>Save</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    
    {listingModalOpen && (
      <div className="modal-overlay" onClick={handleListingModalClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>Update Listing</h2>
          <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange}/>
          <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange}/>
          <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange}/>
          <input type="number" name="bedrooms" placeholder="Bedrooms" value={formData.bedrooms} onChange={handleChange}/>
          <input type="number" name="bathrooms" placeholder="Bathrooms" value={formData.bathrooms} onChange={handleChange}/>
          <label>
            <input type="checkbox" name="furnished" checked={formData.furnished} onChange={handleChange}/>
            Furnished
          </label>
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange}/>
          <div className="modal-buttons">
            <button className="cancel" onClick={handleListingModalClose}>Cancel</button>
            <button className="save" onClick={handleUpdateSubmit}>Save</button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
};

export default LandlordDashboard;


