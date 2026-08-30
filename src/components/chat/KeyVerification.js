import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { KeyService } from '../../services';
import { markKeyAsVerified, getUserKey } from '../../store/slices/keysSlice';
import { Icon, Spinner } from '../ui/Icon';
import './chat.css';
const KeyVerification = ({ contactId, onClose }) => {
    const dispatch = useAppDispatch();
    const [verifying, setVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState(null);
    const [fingerprint, setFingerprint] = useState(null);
    const { contactKeys, serverKey } = useAppSelector((s) => s.keys);
    const { contacts } = useAppSelector((s) => s.contacts);
    const contact = contacts.find((c) => c.contactId === contactId);
    const contactKey = contactKeys[contactId];
    useEffect(() => {
        if (contactKey?.verified)
            setIsVerified(true);
    }, [contactKey]);
    useEffect(() => {
        if (!contactKeys[contactId]?.publicKey) {
            dispatch(getUserKey(contactId))
                .unwrap()
                .catch(() => setError('Failed to fetch contact key. Please try again.'));
        }
    }, [contactId, dispatch]);
    useEffect(() => {
        const ck = contactKeys[contactId];
        if (!ck?.publicKey) {
            setFingerprint(null);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const data = new TextEncoder().encode(ck.publicKey);
                const hash = await crypto.subtle.digest('SHA-256', data);
                const hex = Array.from(new Uint8Array(hash))
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');
                const grouped = hex.match(/.{1,4}/g)?.join(' ') ?? hex;
                if (!cancelled)
                    setFingerprint(grouped);
            }
            catch (e) {
                console.error(e);
                if (!cancelled)
                    setError('Failed to generate key fingerprint');
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [contactId, contactKey]);
    const runVerify = async () => {
        const ck = contactKeys[contactId];
        if (!ck?.publicKey || !ck?.signature || !serverKey) {
            setError('Missing keys for verification');
            return;
        }
        setVerifying(true);
        setError(null);
        try {
            const ok = await KeyService.verifyKeySignature(ck, serverKey);
            setIsVerified(ok);
            if (!ok)
                setError('Signature verification failed. This key may not be authentic.');
        }
        catch (e) {
            console.error(e);
            setError('Failed to verify key signature');
        }
        finally {
            setVerifying(false);
        }
    };
    const manualVerify = () => {
        dispatch(markKeyAsVerified(contactId));
        setIsVerified(true);
    };
    return (_jsx("div", { className: "kv-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Verify keys", children: _jsxs("div", { className: "kv-modal", children: [_jsxs("header", { className: "kv-modal__head", children: [_jsxs("h3", { className: "kv-modal__title", children: ["Verify keys with ", contact?.username ?? 'contact'] }), _jsx("button", { type: "button", className: "om-icon-btn", onClick: onClose, "aria-label": "Close", children: _jsx(Icon, { name: "x", size: 16 }) })] }), _jsxs("div", { className: "kv-modal__body", children: [_jsx("p", { className: "kv-intro", children: "Compare the fingerprint below with what your contact sees on their device. If both match, your channel is authentic." }), _jsxs("div", { children: [_jsx("div", { style: {
                                        fontSize: 'var(--fs-xs)',
                                        color: 'var(--color-text-subtle)',
                                        marginBottom: 'var(--sp-2)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                    }, children: "Fingerprint" }), _jsx("div", { className: "kv-fingerprint", "aria-live": "polite", children: fingerprint ?? (_jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: 8 }, children: [_jsx(Spinner, { size: 14 }), " Generating\u2026"] })) })] }), _jsxs("div", { className: `kv-status ${isVerified ? 'kv-status--ok' : ''}`, children: [_jsx("span", { className: "kv-status__dot", "aria-hidden": "true" }), isVerified ? 'Verified' : 'Not verified'] }), error && (_jsx("div", { style: {
                                color: 'var(--color-danger)',
                                background: 'var(--color-danger-soft)',
                                padding: 'var(--sp-3)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--fs-sm)',
                            }, children: error })), _jsxs("div", { className: "kv-instructions", children: [_jsx("h4", { children: "How to verify" }), _jsxs("ol", { children: [_jsx("li", { children: "Ask your contact to open this same screen." }), _jsx("li", { children: "Read the fingerprints aloud or compare over a trusted channel." }), _jsx("li", { children: "If they match, tap \u201CI verified this key\u201D." }), _jsx("li", { children: "If they don't, your connection may be tampered with \u2014 don't send sensitive messages." })] })] })] }), _jsxs("footer", { className: "kv-modal__foot", children: [_jsxs("button", { type: "button", className: "om-btn om-btn--quiet", onClick: runVerify, disabled: verifying || !contactKey || !serverKey, children: [verifying && _jsx(Spinner, { size: 14 }), verifying ? 'Verifying…' : 'Verify signature'] }), _jsx("button", { type: "button", className: "om-btn om-btn--primary", onClick: manualVerify, disabled: isVerified || !contactKey, children: isVerified ? (_jsxs(_Fragment, { children: [_jsx(Icon, { name: "check", size: 14, strokeWidth: 2.5 }), " Verified"] })) : ('I verified this key') })] })] }) }));
};
export default KeyVerification;
