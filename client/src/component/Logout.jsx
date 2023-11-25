import React, { useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Logout = () => {
  const history = useHistory();

  useEffect(() => {
    const logout = async () => {
      try {
        // Clear the token from localStorage
        localStorage.removeItem('token');
        // Remove the Authorization header for Axios
        delete axios.defaults.headers.common['Authorization'];
        // Redirect to the login page
        history.push('/login');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    logout();
  }, [history]);

  return (
    <div
      style={{
        backgroundColor: 'black', // Dark background color
        color: 'white', // Light text color
        minHeight: '100vh', // Full height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1>You have been successfully logged out!</h1>
    </div>
  );
};

export default Logout;
