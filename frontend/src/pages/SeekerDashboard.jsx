import React, { useEffect, useState, useContext } from 'react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import './dashboard.css';

const SeekerDashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
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
        setProfileImage(data.profile_image || null);
      })
      .catch(err => {
        console.error('Failed to fetch profile:', err);
      });
  }, [user, accessToken, update]);

  if (!user) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ color: '#ef4444', fontSize: '1.125rem' }}>User data missing. Please log in again.</p>
      </div>
    );
  }

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

      {profile && (
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
              <div className="modal" onClick={(e) => e.stopPropagation()}>
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

    </div>
  );
};

export default SeekerDashboard;


