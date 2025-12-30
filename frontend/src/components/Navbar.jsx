import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './nav.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand">HouseMatch Zambia</div>

        {/* Hamburger for small screens */}
        <button
          className="hamburger"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Navigation links */}
        <div className={`nav-links ${isOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-item">Home</Link>
          {user && <Link to="/messages" className="nav-item">Messages</Link>}

          {user && user.role === 'landlord' && (
            <>
              <Link to="/dashboard/landlord" className="nav-item">Dashboard</Link>
              <Link to="/post" className="nav-item">Add Listing</Link>
            </>
          )}

          {user && user.role === 'seeker' && (
            <Link to="/dashboard/seeker" className="nav-item">Dashboard</Link>
          )}

          {!user ? (
            <Link to="/login" className="btn-login">Login</Link>
          ) : (
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
