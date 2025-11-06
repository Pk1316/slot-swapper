// components/Navbar.jsx
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onRefresh }) {
  const navigate = useNavigate();
  return (
    <div className="flex gap-3 mb-6">
      <button onClick={onRefresh} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
        🔄 Get My Events
      </button>
      <button onClick={() => navigate('/requests')} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
        📋 Swap Requests
      </button>
      <button onClick={() => navigate('/marketplace')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
        🛒 Marketplace
      </button>
    </div>
  );
}
