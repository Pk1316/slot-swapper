import React, { useEffect, useState } from 'react';
import api from '../api.js';

export default function MarketplacePage() {
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);

  async function loadData() {
    const [s1, s2] = await Promise.all([
      api.get('/swap/swappable-slots'),
      api.get('/events'),
    ]);
    setSlots(s1.data);
    setMySwappables(s2.data.filter((e) => e.status === 'SWAPPABLE'));
  }

  async function requestSwap(theirSlotId, mySlotId) {
    if (!mySlotId) return alert('Select your slot first!');
    await api.post('/swap/swap-request', { theirSlotId, mySlotId });
    loadData();
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="p-6">
      <h2>🌍 Marketplace</h2>
      <ul>
        {slots.map((s) => (
          <li key={s._id}>
            <b>{s.title}</b> ({new Date(s.startTime).toLocaleString()})  
            by <i>{s.owner.name}</i>
            <div>
              Offer your slot:
              <select onChange={(e) => requestSwap(s._id, e.target.value)}>
                <option value="">Select slot</option>
                {mySwappables.map((ms) => (
                  <option key={ms._id} value={ms._id}>
                    {ms.title} ({new Date(ms.startTime).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
