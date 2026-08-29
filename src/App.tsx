import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ContactRequestsPage from './pages/ContactRequestsPage';
import { Login, Register } from './components/auth';
import { ChatLayout } from './components/chat';
import { Notifications } from './components/common';
import { useAppDispatch, useAppSelector } from './store';
import { ensureLocalKeysBootstrapped } from './store/slices/keysSlice';

const AppRoutes = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  // Every time the user becomes authenticated, make sure a local ECDH key
  // pair exists and is published. This covers the case where a user logged in
  // before the key bootstrap was wired, and it is a no-op once bootstrapped.
  useEffect(() => {
    if (!isAuthenticated) return;
    void dispatch(ensureLocalKeysBootstrapped());
  }, [isAuthenticated, dispatch]);

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
