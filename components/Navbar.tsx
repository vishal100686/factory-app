
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types'; // Import User type
import { ADMIN_USER_ID, DEFAULT_USER_ID } from '../constants'; // Import constants


const UserSwitcher: React.FC = () => {
    const { users, currentUser, setCurrentUser } = useAppContext();
    
    const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentUser(event.target.value);
    };

    return (
        <div className="relative">
            <select 
                value={currentUser?.id || ''} 
                onChange={handleUserChange}
                className="bg-brand-primary text-white p-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-brand-accent"
            >
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.name} {user.isAdmin ? "(Admin)" : ""}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};


const Navbar: React.FC = () => {
  const { currentUser } = useAppContext();

  return (
    <nav className="bg-brand-primary shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white hover:text-brand-accent transition-colors">
              FactoryPulse 🏭
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-sky-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Home
            </Link>
            {currentUser?.isAdmin && (
              <Link to="/admin" className="text-sky-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Admin Panel
              </Link>
            )}
            {currentUser && (
              <div className="text-sm text-brand-accent font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Points: {currentUser.points}
              </div>
            )}
             <UserSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;