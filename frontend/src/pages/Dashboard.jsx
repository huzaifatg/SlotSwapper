import { useState, useEffect } from 'react';
import { eventService } from '../services/api';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getMyEvents();
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await eventService.createEvent(formData);
      setFormData({ title: '', startTime: '', endTime: '' });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  const handleStatusChange = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'BUSY' ? 'SWAPPABLE' : 'BUSY';
    try {
      await eventService.updateEventStatus(eventId, newStatus);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (eventId, eventStatus) => {
    if (eventStatus === 'SWAP_PENDING') {
      setError('Cannot delete event with pending swap request');
      return;
    }

    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await eventService.deleteEvent(eventId);
        fetchEvents();
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event');
      }
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
      BUSY: 'bg-yellow-100 text-yellow-800',
      SWAPPABLE: 'bg-green-100 text-green-800',
      SWAP_PENDING: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || styles.BUSY;
  };

  return (
    <div className="min-h-[92vh] bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ New Event'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Event</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter event title"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Create Event
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No events yet. Create your first event!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div 
              key={event._id} 
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex-1">{event.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyles(event.status)}`}>
                  {event.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 text-gray-600">
                <p><strong className="text-gray-700">Start:</strong> {formatDateTime(event.startTime)}</p>
                <p><strong className="text-gray-700">End:</strong> {formatDateTime(event.endTime)}</p>
              </div>

              <div className="space-y-2">
                {event.status !== 'SWAP_PENDING' && (
                  <button
                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      event.status === 'BUSY' 
                        ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                    onClick={() => handleStatusChange(event._id, event.status)}
                  >
                    {event.status === 'BUSY' ? 'Mark as Swappable' : 'Mark as Busy'}
                  </button>
                )}

                {event.status === 'SWAP_PENDING' && (
                  <p className="text-center text-gray-500 italic py-2">⏳ Swap request pending</p>
                )}

                <button
                  className="w-full py-2 bg-gray-200 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDelete(event._id, event.status)}
                  disabled={event.status === 'SWAP_PENDING'}
                  title={event.status === 'SWAP_PENDING' ? 'Cannot delete event with pending swap' : 'Delete event'}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
