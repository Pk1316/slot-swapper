import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../Authcontext';

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // ✅ Fetch logged-in user's events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create a new event
  const createEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        '/events',
        { title, startTime: start, endTime: end, status: 'BUSY' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setStart('');
      setEnd('');
      fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  // ✅ Mark event as SWAPPABLE
  const makeSwappable = async (id) => {
    try {
      await api.patch(
        `/events/${id}`,
        { status: 'SWAPPABLE' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEvents();
    } catch (err) {
      console.error('Error marking event swappable:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name || 'User'}
        </h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={fetchEvents}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          🔄 Get My Events
        </button>

        <button
          onClick={() => navigate('/requests')}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
        >
          📋 View Swap Requests
        </button>

        <button
          onClick={() => navigate('/marketplace')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          🛒 Go to Marketplace
        </button>
      </div>

      {/* Event creation form */}
      <form onSubmit={createEvent} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded w-1/4"
          required
        />
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 rounded w-1/4"
          required
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 rounded w-1/4"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600"
        >
          ➕ Add
        </button>
      </form>

      {/* My Events section */}
      <h2 className="text-lg font-semibold mb-2">My Events</h2>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <p>No events yet. Create one above!</p>
      ) : (
        events.map((ev) => (
          <div
            key={ev._id}
            className="border p-3 mb-3 rounded-lg flex justify-between items-center shadow-sm bg-white"
          >
            <div>
              <p className="font-semibold">{ev.title}</p>
              <p className="text-sm text-gray-600">
                {new Date(ev.startTime).toLocaleString()} →{' '}
                {new Date(ev.endTime).toLocaleString()}
              </p>
              <p className="text-sm mt-1">
                Status: <span className="font-semibold">{ev.status}</span>
              </p>
            </div>
            {ev.status === 'BUSY' && (
              <button
                onClick={() => makeSwappable(ev._id)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                🔁 Make Swappable
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
