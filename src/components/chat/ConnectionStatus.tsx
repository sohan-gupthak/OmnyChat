import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../store';
import webrtcService from '../../services/webrtc.service';
import websocketService from '../../services/websocket.service';

type ConnectionType = 'p2p' | 'server' | 'offline';

const LABELS: Record<ConnectionType, string> = {
  p2p: 'Direct',
  server: 'Relayed',
  offline: 'Offline',
};

const TITLES: Record<ConnectionType, string> = {
  p2p: 'Peer-to-peer connection',
  server: 'Server-relayed encrypted connection',
  offline: 'No connection available',
};

const ConnectionStatus: React.FC = () => {
  const [type, setType] = useState<ConnectionType>('server');
  const { selectedContact } = useAppSelector((s) => s.contacts);

  useEffect(() => {
    if (!selectedContact) {
      setType('offline');
      return;
    }
    const check = () => {
      if (webrtcService.hasActiveConnection(selectedContact.contactId)) {
        setType('p2p');
      } else if (websocketService.isConnected()) {
        setType('server');
      } else {
        setType('offline');
      }
    };
    check();
    const onP2P = (peerId: number, on: boolean) => {
      if (peerId === selectedContact.contactId) setType(on ? 'p2p' : 'server');
    };
    const onSrv = (on: boolean) => {
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

  if (!selectedContact) return null;
  const cls =
    type === 'p2p' ? 'conn-dot conn-dot--ok' : type === 'offline' ? 'conn-dot conn-dot--bad' : 'conn-dot conn-dot--warn';

  return (
    <span className={cls} title={TITLES[type]} aria-live="polite">
      <span className="conn-dot__swatch" aria-hidden="true" />
      {LABELS[type]}
    </span>
  );
};

export default ConnectionStatus;