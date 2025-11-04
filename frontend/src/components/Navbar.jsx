import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarClock } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link 
            to={isAuthenticated ? "/dashboard" : "/login"} 
            className="flex items-center gap-2 text-2xl font-bold text-primary-500 hover:text-primary-600 transition-colors"
          >
            <CalendarClock className="w-7 h-7" />
            <span>SlotSwapper</span>
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                to="/marketplace" 
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
              >
                Marketplace
              </Link>
              <Link 
                to="/requests" 
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
              >
                Requests
              </Link>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <span className="text-gray-600">👤 {user?.name}</span>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-primary-500 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
