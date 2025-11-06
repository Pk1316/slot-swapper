import React, { useEffect, useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../Authontext';
import socket from '../socket';

export default function Marketplace() {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);

  useEffect(() => {
    refresh();
    socket.on('swap:incoming', () => refresh());
    socket.on('swap:updated', () => refresh());
    return () => { socket.off('swap:incoming'); socket.off('swap:updated'); };
  }, []);

  async function refresh() {
    const s = await api.get('/swap/swappable-slots');
    setSlots(s.data);
    const mine = await api.get('/events');
    setMySwappables(mine.data.filter(e => e.status === 'SWAPPABLE'));
  }

  async function requestSwap(theirSlotId, mySlotId) {
    await api.post('/swap/swap-request', { theirSlotId, mySlotId });
    // optimistic: refresh lists
    await refresh();
  }

  return (
    <div>
      <h2>Marketplace</h2>
      <ul>
        {slots.map(slot => (
          <li key={slot._id}>
            <strong>{slot.title}</strong> by {slot.owner.name} — {new Date(slot.startTime).toLocaleString()}
            <div>
              <label>Offer your:</label>
              <select onChange={(e) => requestSwap(slot._id, e.target.value)}>
                <option value="">Choose</option>
                {mySwappables.map(ms => <option key={ms._id} value={ms._id}>{ms.title} — {new Date(ms.startTime).toLocaleString()}</option>)}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
