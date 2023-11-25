import React, { useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';



const Logout = () => {
  const history = useHistory();

  useEffect(() => {
    const logout = async () => {
      try {
        await axios.get('https://dvisual-deployment.vercel.app/logout');
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
