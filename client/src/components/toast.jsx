// src/components/Toast.jsx
import React, { useEffect, useState } from 'react';
import socket from '../socket';

export default function Toast() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.on('swap:incoming', (data) => {
      setMessage(`🔔 New swap request from ${data.requester.name}`);
      setTimeout(() => setMessage(''), 3000);
    });

    socket.on('swap:updated', (data) => {
      setMessage(`🔁 Swap updated: ${data.status}`);
      setTimeout(() => setMessage(''), 3000);
    });

    return () => {
      socket.off('swap:incoming');
      socket.off('swap:updated');
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-bounce">
      {message}
    </div>
  );
}
