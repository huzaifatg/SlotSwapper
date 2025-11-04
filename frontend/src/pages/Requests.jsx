import { useState, useEffect } from 'react';
import { swapService } from '../services/api';

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('incoming');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [incomingResponse, outgoingResponse] = await Promise.all([
        swapService.getIncomingSwaps(),
        swapService.getOutgoingSwaps()
      ]);
      
      setIncomingRequests(incomingResponse.data);
      setOutgoingRequests(outgoingResponse.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, accepted) => {
    try {
      await swapService.respondToSwap(requestId, accepted);
      alert(accepted ? 'Swap accepted successfully!' : 'Swap rejected');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond to swap');
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const getStatusStyles = (status) => {
    const styles = {
      PENDING: { bg: 'bg-gray-100', text: 'text-gray-800' },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800' }
    };
    return styles[status] || styles.PENDING;
  };

  return (
    <div className="min-h-[92vh] bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📬 Swap Requests</h1>
        </div>

      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-4 px-6 font-semibold transition-colors border-b-2 ${
            activeTab === 'incoming'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Incoming ({incomingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-4 px-6 font-semibold transition-colors border-b-2 ${
            activeTab === 'outgoing'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Outgoing ({outgoingRequests.length})
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading requests...</div>
      ) : (
        <>
          {/* Incoming Requests Tab */}
          {activeTab === 'incoming' && (
            <div className="space-y-6">
              {incomingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No incoming swap requests</p>
                </div>
              ) : (
                incomingRequests.map((request) => (
                  <div key={request._id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Swap Request from {request.requesterId?.name || 'Unknown User'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(request.status).bg} ${getStatusStyles(request.status).text}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg mb-6">
                      <div>
                        <h4 className="font-semibold text-primary-600 mb-3">They offer:</h4>
                        <div className="text-gray-700">
                          <p className="font-semibold text-lg mb-2">{request.mySlotId?.title || 'N/A'}</p>
                          {request.mySlotId?.startTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.mySlotId.startTime)}</p>
                          )}
                          {request.mySlotId?.endTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.mySlotId.endTime)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center text-3xl text-primary-500">
                        ⇄
                      </div>

                      <div>
                        <h4 className="font-semibold text-primary-600 mb-3">For your slot:</h4>
                        <div className="text-gray-700">
                          <p className="font-semibold text-lg mb-2">{request.theirSlotId?.title || 'N/A'}</p>
                          {request.theirSlotId?.startTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.theirSlotId.startTime)}</p>
                          )}
                          {request.theirSlotId?.endTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.theirSlotId.endTime)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {request.status === 'PENDING' && (
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleResponse(request._id, true)}
                          className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleResponse(request._id, false)}
                          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}

                    {request.createdAt && (
                      <p className="text-gray-500 text-sm mt-4">
                        Requested on: {formatDateTime(request.createdAt)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Outgoing Requests Tab */}
          {activeTab === 'outgoing' && (
            <div className="space-y-6">
              {outgoingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No outgoing swap requests</p>
                  <p className="text-gray-500 mt-2">Visit the marketplace to request a swap!</p>
                </div>
              ) : (
                outgoingRequests.map((request) => (
                  <div key={request._id} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Swap Request to {request.targetOwnerId?.name || 'Unknown User'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(request.status).bg} ${getStatusStyles(request.status).text}`}>
                        {request.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-primary-600 mb-3">Your slot:</h4>
                        <div className="text-gray-700">
                          <p className="font-semibold text-lg mb-2">{request.mySlotId?.title || 'N/A'}</p>
                          {request.mySlotId?.startTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.mySlotId.startTime)}</p>
                          )}
                          {request.mySlotId?.endTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.mySlotId.endTime)}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-center text-3xl text-primary-500">
                        ⇄
                      </div>

                      <div>
                        <h4 className="font-semibold text-primary-600 mb-3">Their slot:</h4>
                        <div className="text-gray-700">
                          <p className="font-semibold text-lg mb-2">{request.theirSlotId?.title || 'N/A'}</p>
                          {request.theirSlotId?.startTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.theirSlotId.startTime)}</p>
                          )}
                          {request.theirSlotId?.endTime && (
                            <p className="text-sm text-gray-600">{formatDateTime(request.theirSlotId.endTime)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {request.createdAt && (
                      <p className="text-gray-500 text-sm mt-4">
                        Requested on: {formatDateTime(request.createdAt)}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default Requests;
