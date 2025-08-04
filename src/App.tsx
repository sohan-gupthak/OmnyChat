import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ContactRequestsPage from './pages/ContactRequestsPage';
import { Login, Register } from './components/auth';
import { ChatLayout } from './components/chat';
import { Notifications } from './components/common';
import { useAppSelector } from './store';

const AppRoutes = () => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  return (
    <>
      <Notifications />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/chat" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/chat" />} />
        <Route path="/chat" element={isAuthenticated ? <ChatLayout /> : <Navigate to="/login" />} />
        <Route path="/contact-requests" element={isAuthenticated ? <ContactRequestsPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
