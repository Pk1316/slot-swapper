import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../Authontext';
import socket from '../socket';

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const { user } = useContext(AuthContext);

  async function load() {
    const res = await api.get('/swap/my-requests');
    setIncoming(res.data.incoming);
    setOutgoing(res.data.outgoing);
  }

  useEffect(() => {
    load();
    socket.on('swap:incoming', load);
    socket.on('swap:updated', load);
    return () => { socket.off('swap:incoming'); socket.off('swap:updated'); };
  }, []);

  async function respond(reqId, accept) {
    await api.post(`/swap/swap-response/${reqId}`, { accept });
    const io = await api.get('/swap/my-requests');
    setIncoming(io.data.incoming);
    setOutgoing(io.data.outgoing);
  }

  return (
    <div>
      <h2>Incoming</h2>
      <ul>
        {incoming.map(r => (
          <li key={r._id}>
            {r.requester.name} wants your {r.theirSlot.title} for their {r.mySlot.title}
            <button onClick={() => respond(r._id, true)}>Accept</button>
            <button onClick={() => respond(r._id, false)}>Reject</button>
          </li>
        ))}
      </ul>

      <h2>Outgoing</h2>
      <ul>
        {outgoing.map(r => (
          <li key={r._id}>
            To {r.responder.name}: {r.mySlot.title} → {r.theirSlot.title} — {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
