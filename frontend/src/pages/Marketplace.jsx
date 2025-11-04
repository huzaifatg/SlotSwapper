import { useState, useEffect } from 'react';
import { swapService, eventService } from '../services/api';

const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [swappableResponse, myEventsResponse] = await Promise.all([
        swapService.getSwappableSlots(),
        eventService.getMyEvents()
      ]);
      
      setSwappableSlots(swappableResponse.data);
      setMySwappableSlots(
        myEventsResponse.data.filter(event => event.status === 'SWAPPABLE')
      );
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const openSwapModal = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
    setSelectedMySlot('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSlot(null);
    setSelectedMySlot('');
  };

  const handleSwapRequest = async () => {
    if (!selectedMySlot) {
      alert('Please select one of your slots to swap');
      return;
    }

    try {
      setSubmitting(true);
      await swapService.initiateSwap({
        mySlotId: selectedMySlot,
        theirSlotId: selectedSlot._id
      });
      alert('Swap request sent successfully!');
      closeModal();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-[92vh] bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛒 Marketplace</h1>
          <p className="text-gray-600">Browse and request swappable slots from other users</p>
        </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading marketplace...</div>
      ) : swappableSlots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No swappable slots available at the moment.</p>
          <p className="text-gray-500 mt-2">Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {swappableSlots.map((slot) => (
            <div 
              key={slot._id} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex-1">{slot.title}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  SWAPPABLE
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-gray-600">
                <p><strong className="text-gray-700">Owner:</strong> {slot.ownerId.name}</p>
                <p><strong className="text-gray-700">Start:</strong> {formatDateTime(slot.startTime)}</p>
                <p><strong className="text-gray-700">End:</strong> {formatDateTime(slot.endTime)}</p>
              </div>

              <button
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  mySwappableSlots.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
                onClick={() => openSwapModal(slot)}
                disabled={mySwappableSlots.length === 0}
              >
                {mySwappableSlots.length === 0 ? 'No Swappable Slots' : 'Request Swap'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Swap Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Request Slot Swap</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-semibold text-primary-600 mb-2">You want this slot:</h3>
                <p className="text-lg font-semibold text-gray-900">{selectedSlot.title}</p>
                <p className="text-gray-600">{formatDateTime(selectedSlot.startTime)} - {formatDateTime(selectedSlot.endTime)}</p>
                <p className="text-gray-500">Owner: {selectedSlot.ownerId.name}</p>
              </div>

              <div className="text-center text-3xl my-4">⬇️</div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Select your slot to offer:</h3>
                {mySwappableSlots.length === 0 ? (
                  <p className="text-red-600 italic bg-red-50 p-4 rounded-lg">
                    You don't have any swappable slots. Mark a slot as swappable first.
                  </p>
                ) : (
                  <select
                    value={selectedMySlot}
                    onChange={(e) => setSelectedMySlot(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value="">-- Select a slot --</option>
                    {mySwappableSlots.map((slot) => (
                      <option key={slot._id} value={slot._id}>
                        {slot.title} ({formatDateTime(slot.startTime)})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button 
                onClick={closeModal}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSwapRequest}
                disabled={!selectedMySlot || submitting}
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {submitting ? 'Sending...' : 'Send Swap Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Marketplace;
