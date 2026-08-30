import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
        if (!isAuthenticated)
            return;
        void dispatch(ensureLocalKeysBootstrapped());
    }, [isAuthenticated, dispatch]);
    return (_jsxs(_Fragment, { children: [_jsx(Notifications, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/login", element: !isAuthenticated ? _jsx(Login, {}) : _jsx(Navigate, { to: "/chat" }) }), _jsx(Route, { path: "/register", element: !isAuthenticated ? _jsx(Register, {}) : _jsx(Navigate, { to: "/chat" }) }), _jsx(Route, { path: "/chat", element: isAuthenticated ? _jsx(ChatLayout, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "/contact-requests", element: isAuthenticated ? _jsx(ContactRequestsPage, {}) : _jsx(Navigate, { to: "/login" }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/" }) })] })] }));
};
export default AppRoutes;
