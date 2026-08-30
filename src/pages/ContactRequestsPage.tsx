import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ContactRequests } from '../components/ContactRequests';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchPendingRequests,
  fetchSentRequests,
} from '../store/slices/contactRequestsSlice';
import { Icon } from '../components/ui/Icon';

const ContactRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(fetchPendingRequests());
    dispatch(fetchSentRequests());
  }, [user, navigate, dispatch]);

  return (
    <div className="req-page">
      <header className="req-page__head">
        <button
          type="button"
          className="om-icon-btn"
          onClick={() => navigate('/chat')}
          aria-label="Back to chat"
          title="Back to chat"
        >
          <Icon name="arrow-left" size={16} />
        </button>
        <h1 className="req-page__title">Contact requests</h1>
      </header>
      <main className="req-page__body">
        <ContactRequests />
      </main>
    </div>
  );
};

export default ContactRequestsPage;