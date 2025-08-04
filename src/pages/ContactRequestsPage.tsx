import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactRequests } from '../components/ContactRequests';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPendingRequests, fetchSentRequests } from '../store/slices/contactRequestsSlice';
import './ContactRequestsPage.css';

const ContactRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch contact requests
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());
  }, [user, navigate, dispatch]);
  
  return (
    <div className="contact-requests-page">
      <div className="page-header">
        <button 
          className="back-button"
          onClick={() => navigate('/chat')}
        >
          <i className="fas fa-arrow-left"></i> Back to Chat
        </button>
        <h1>Contact Requests</h1>
      </div>
      
      <div className="page-content">
        <ContactRequests />
      </div>
    </div>
  );
};

export default ContactRequestsPage;
