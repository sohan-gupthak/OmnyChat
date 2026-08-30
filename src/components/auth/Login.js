import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { login } from '../../store/slices/authSlice';
import { Icon, Spinner } from '../ui/Icon';
import './auth.css';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error: authError } = useAppSelector((s) => s.auth);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        try {
            const result = await dispatch(login({ email, password }));
            if (login.fulfilled.match(result)) {
                navigate('/chat');
            }
            else if (login.rejected.match(result)) {
                setError(result.payload || 'Login failed');
            }
        }
        catch {
            setError('An unexpected error occurred');
        }
    };
    return (_jsxs("div", { className: "auth", children: [_jsxs("aside", { className: "auth__pane", "aria-hidden": "false", children: [_jsxs(Link, { to: "/", className: "auth__pane-brand", children: [_jsx("span", { className: "mark", children: _jsx(Icon, { name: "shield", size: 14, strokeWidth: 2.25 }) }), "OmnyChat"] }), _jsxs("div", { className: "auth__pane-hero", children: [_jsxs("h1", { children: ["Private conversations, ", _jsx("em", { children: "quietly designed." })] }), _jsx("p", { children: "End-to-end encrypted messaging with hybrid delivery \u2014 peer-to-peer when possible, server-relayed when not." }), _jsxs("ul", { className: "auth__pane-list", children: [_jsxs("li", { children: [_jsx("span", { className: "check", children: _jsx(Icon, { name: "check", size: 12, strokeWidth: 2.5 }) }), "AES-GCM with per-conversation keys"] }), _jsxs("li", { children: [_jsx("span", { className: "check", children: _jsx(Icon, { name: "check", size: 12, strokeWidth: 2.5 }) }), "ECDH key agreement with optional fingerprint verification"] }), _jsxs("li", { children: [_jsx("span", { className: "check", children: _jsx(Icon, { name: "check", size: 12, strokeWidth: 2.5 }) }), "No phone number, no address book, no tracking"] })] })] }), _jsxs("p", { className: "auth__pane-foot", children: ["\u00A9 ", new Date().getFullYear(), " OmnyChat"] })] }), _jsx("main", { className: "auth__form-wrap", children: _jsxs("form", { className: "auth__form", onSubmit: handleSubmit, noValidate: true, children: [_jsxs("header", { className: "auth__head", children: [_jsx("h2", { children: "Welcome back" }), _jsx("p", { children: "Sign in to continue your conversations." })] }), (error || authError) && (_jsx("div", { className: "auth__error", role: "alert", children: error || authError })), _jsxs("div", { className: "auth__field", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", className: "om-input", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", autoComplete: "email", disabled: isLoading, required: true })] }), _jsxs("div", { className: "auth__field", children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", className: "om-input", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Your password", autoComplete: "current-password", disabled: isLoading, required: true })] }), _jsxs("button", { type: "submit", className: "om-btn om-btn--primary om-btn--block", disabled: isLoading, style: { height: 44 }, children: [isLoading ? _jsx(Spinner, { size: 16 }) : null, isLoading ? 'Signing in…' : 'Sign in'] }), _jsxs("p", { className: "auth__foot", children: ["New here?", ' ', _jsx(Link, { to: "/register", className: "om-link", children: "Create an account" })] })] }) })] }));
};
export default Login;
