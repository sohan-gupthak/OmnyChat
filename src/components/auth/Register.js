import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { register } from '../../store/slices/authSlice';
import { Icon, Spinner } from '../ui/Icon';
import './auth.css';
const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isLoading, error: authError } = useAppSelector((s) => s.auth);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!username || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        try {
            const result = await dispatch(register({ username, email, password }));
            if (register.fulfilled.match(result)) {
                navigate('/chat');
            }
            else if (register.rejected.match(result)) {
                setError(result.payload || 'Registration failed');
            }
        }
        catch {
            setError('An unexpected error occurred');
        }
    };
    const pwOk = password.length === 0 || password.length >= 8;
    const pwMatch = confirmPassword.length === 0 || password === confirmPassword;
    return (_jsxs("div", { className: "auth", children: [_jsxs("aside", { className: "auth__pane", children: [_jsxs(Link, { to: "/", className: "auth__pane-brand", children: [_jsx("span", { className: "mark", children: _jsx(Icon, { name: "shield", size: 14, strokeWidth: 2.25 }) }), "OmnyChat"] }), _jsxs("div", { className: "auth__pane-hero", children: [_jsxs("h1", { children: ["Start a private channel in ", _jsx("em", { children: "under a minute." })] }), _jsx("p", { children: "Create an account, generate your encryption keys locally, and start a secure conversation right away." }), _jsxs("ul", { className: "auth__pane-list", children: [_jsxs("li", { children: [_jsx("span", { className: "check", children: _jsx(Icon, { name: "check", size: 12, strokeWidth: 2.5 }) }), "Keys generated on your device \u2014 never uploaded"] }), _jsxs("li", { children: [_jsx("span", { className: "check", children: _jsx(Icon, { name: "check", size: 12, strokeWidth: 2.5 }) }), "Direct messages, server fallback, and key verification built in"] }), _jsxs("li", { children: [_jsx("span", { className: "check", children: _jsx(Icon, { name: "check", size: 12, strokeWidth: 2.5 }) }), "Minimal account info: just a username and an email"] })] })] }), _jsxs("p", { className: "auth__pane-foot", children: ["\u00A9 ", new Date().getFullYear(), " OmnyChat"] })] }), _jsx("main", { className: "auth__form-wrap", children: _jsxs("form", { className: "auth__form", onSubmit: handleSubmit, noValidate: true, children: [_jsxs("header", { className: "auth__head", children: [_jsx("h2", { children: "Create your account" }), _jsx("p", { children: "A username, an email, a password. That's it." })] }), (error || authError) && (_jsx("div", { className: "auth__error", role: "alert", children: error || authError })), _jsxs("div", { className: "auth__field", children: [_jsx("label", { htmlFor: "username", children: "Username" }), _jsx("input", { id: "username", type: "text", className: "om-input", value: username, onChange: (e) => setUsername(e.target.value), placeholder: "Choose a username", autoComplete: "username", disabled: isLoading, required: true })] }), _jsxs("div", { className: "auth__field", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", className: "om-input", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com", autoComplete: "email", disabled: isLoading, required: true })] }), _jsxs("div", { className: "auth__field", children: [_jsx("label", { htmlFor: "password", children: "Password" }), _jsx("input", { id: "password", type: "password", className: "om-input", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "At least 8 characters", autoComplete: "new-password", disabled: isLoading, required: true }), !pwOk && (_jsx("span", { className: "auth__hint", children: "Use 8 characters or more." }))] }), _jsxs("div", { className: "auth__field", children: [_jsx("label", { htmlFor: "confirmPassword", children: "Confirm password" }), _jsx("input", { id: "confirmPassword", type: "password", className: "om-input", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "Repeat the password", autoComplete: "new-password", disabled: isLoading, required: true }), !pwMatch && _jsx("span", { className: "auth__hint", children: "Passwords don't match." })] }), _jsxs("button", { type: "submit", className: "om-btn om-btn--primary om-btn--block", disabled: isLoading, style: { height: 44 }, children: [isLoading ? _jsx(Spinner, { size: 16 }) : null, isLoading ? 'Creating account…' : 'Create account'] }), _jsxs("p", { className: "auth__foot", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "om-link", children: "Sign in" })] })] }) })] }));
};
export default Register;
