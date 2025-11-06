import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../Authcontext";

export default function RequestsPage() {
  const { user } = useContext(AuthContext);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all swap requests (incoming/outgoing)
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/swap/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncoming(res.data.incoming || []);
      setOutgoing(res.data.outgoing || []);
    } catch (err) {
      console.error("❌ Error fetching swap requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle accept/reject response
  const handleResponse = async (requestId, accept) => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/swap/swap-response/${requestId}`,
        { accept },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRequests(); // refresh after update
    } catch (err) {
      console.error("❌ Error responding to swap:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className="p-4">Loading swap requests...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Swap Requests</h1>

      {/* ✅ Incoming Requests (where YOU are the responder) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-blue-500">Incoming Requests</h2>

        {incoming.length === 0 && (
          <p className="text-gray-500">No incoming requests yet.</p>
        )}

        {incoming.map((req) => (
          <div
            key={req._id}
            className="border rounded-xl p-4 mb-3 flex justify-between items-center shadow-sm bg-white"
          >
            <div>
              <p className="font-medium text-gray-800">
                <strong>{req.requester.name}</strong> wants to swap:
              </p>
              <p className="mt-1 text-gray-700">
                <span className="font-semibold">Your:</span> {req.theirSlot?.title} <br />
                <span className="font-semibold">For:</span> {req.mySlot?.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Status:{" "}
                <span className="font-semibold">
                  {req.status === "PENDING" ? "⏳ Pending" : req.status}
                </span>
              </p>
            </div>

            {req.status === "PENDING" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleResponse(req._id, true)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => handleResponse(req._id, false)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ✅ Outgoing Requests (where YOU are the requester) */}
      <section>
        <h2 className="text-xl font-semibold mb-3 text-purple-500">Outgoing Requests</h2>

        {outgoing.length === 0 && (
          <p className="text-gray-500">You haven’t sent any requests yet.</p>
        )}

        {outgoing.map((req) => (
          <div
            key={req._id}
            className="border rounded-xl p-4 mb-3 flex justify-between items-center shadow-sm bg-white"
          >
            <div>
              <p className="font-medium text-gray-800">
                You requested <strong>{req.responder.name}</strong> to swap:
              </p>
              <p className="mt-1 text-gray-700">
                <span className="font-semibold">Your:</span> {req.mySlot?.title} <br />
                <span className="font-semibold">For:</span> {req.theirSlot?.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Status:{" "}
                <span className="font-semibold">
                  {req.status === "PENDING"
                    ? "⏳ Waiting for response"
                    : req.status === "ACCEPTED"
                    ? "✅ Accepted"
                    : "❌ Rejected"}
                </span>
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
