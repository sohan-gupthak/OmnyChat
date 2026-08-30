import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAppSelector } from '../../store';
import { useSharedKey } from '../../store/sharedKeyStore';
import { Icon } from '../ui/Icon';
const EncryptionStatus = () => {
    const { selectedContact } = useAppSelector((s) => s.contacts);
    const { contactKeys } = useAppSelector((s) => s.keys);
    const sharedKey = useSharedKey(selectedContact?.contactId);
    if (!selectedContact)
        return null;
    const ck = contactKeys[selectedContact.contactId];
    const contactHasNoKey = ck !== undefined && ck.publicKey === '';
    const hasLocalKey = !!ck && ck.publicKey !== '';
    const hasSharedKey = !!sharedKey;
    const verified = ck?.verified ?? false;
    let label;
    let icon;
    let cls;
    let title;
    if (contactHasNoKey) {
        label = 'No key';
        icon = 'eye';
        cls = 'status-pill status-pill--warn';
        title = 'This contact has not published an encryption key yet';
    }
    else if (hasSharedKey) {
        label = verified ? 'Verified' : 'Encrypted';
        icon = 'lock';
        cls = verified ? 'status-pill status-pill--ok' : 'status-pill status-pill--ok';
        title = verified
            ? 'End-to-end encrypted · key fingerprint verified'
            : 'Messages are end-to-end encrypted';
    }
    else if (hasLocalKey) {
        label = 'Setting up…';
        icon = 'shield';
        cls = 'status-pill status-pill--warn';
        title = 'Deriving shared key';
    }
    else {
        return null;
    }
    return (_jsxs("span", { className: cls, title: title, "aria-live": "polite", children: [_jsx(Icon, { name: icon, size: 12 }), label, verified && _jsx(Icon, { name: "check", size: 12, strokeWidth: 2.5 })] }));
};
export default EncryptionStatus;
