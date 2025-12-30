import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import PostHouseForm from './components/PostHouseForm';
import Login from './components/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import LandlordDashboard from './pages/LandlordDashboard';

import SeekerDashboard from "./pages/SeekerDashboard";
import Chat from './pages/chats';
import ChatsList from './pages/messageList';

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboards */}
          <Route
            path="/dashboard/landlord"
            element={
              <ProtectedRoute allowedRole="landlord">
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/seeker"
            element={
              <ProtectedRoute allowedRole="seeker">
                <SeekerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Listings & Posting */}
          <Route
            path="/post"
            element={
              user?.role === 'landlord' ? (
                <PostHouseForm />
              ) : (
                <Navigate to="/" />
              )
            }
          />


          {/* Inbox Routing */}
          <Route
            path="chat"
            element={
                <Chat />
            }
          />

           <Route
            path="messages"
            element={
                <ChatsList />
            }
          />
        </Routes>
      </main>
    </Router>
  );
};

export default App;