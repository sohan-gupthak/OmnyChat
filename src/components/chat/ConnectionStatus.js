import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import webrtcService from '../../services/webrtc.service';
import websocketService from '../../services/websocket.service';
const LABELS = {
    p2p: 'Direct',
    server: 'Relayed',
    offline: 'Offline',
};
const TITLES = {
    p2p: 'Peer-to-peer connection',
    server: 'Server-relayed encrypted connection',
    offline: 'No connection available',
};
const ConnectionStatus = () => {
    const [type, setType] = useState('server');
    const { selectedContact } = useAppSelector((s) => s.contacts);
    useEffect(() => {
        if (!selectedContact) {
            setType('offline');
            return;
        }
        const check = () => {
            if (webrtcService.hasActiveConnection(selectedContact.contactId)) {
                setType('p2p');
            }
            else if (websocketService.isConnected()) {
                setType('server');
            }
            else {
                setType('offline');
            }
        };
        check();
        const onP2P = (peerId, on) => {
            if (peerId === selectedContact.contactId)
                setType(on ? 'p2p' : 'server');
        };
        const onSrv = (on) => {
            if (!webrtcService.hasActiveConnection(selectedContact.contactId)) {
                setType(on ? 'server' : 'offline');
            }
        };
        webrtcService.onConnectionStatus(onP2P);
        websocketService.on('connection-status', onSrv);
        const id = setInterval(check, 10_000);
        return () => {
            webrtcService.offConnectionStatus(onP2P);
            websocketService.off('connection-status', onSrv);
            clearInterval(id);
        };
    }, [selectedContact]);
    if (!selectedContact)
        return null;
    const cls = type === 'p2p' ? 'conn-dot conn-dot--ok' : type === 'offline' ? 'conn-dot conn-dot--bad' : 'conn-dot conn-dot--warn';
    return (_jsxs("span", { className: cls, title: TITLES[type], "aria-live": "polite", children: [_jsx("span", { className: "conn-dot__swatch", "aria-hidden": "true" }), LABELS[type]] }));
};
export default ConnectionStatus;
