import React from 'react';
import { NavLink } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <section
        style={{
          backgroundColor: '#1a1a1a',
          width: '100%',
          height: '90vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            border: '1px solid #333',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)',
            backgroundColor: '#333',
            color: '#fff',
          }}
        >
          <h1 style={{ fontSize: '2.5em', marginBottom: '20px' }}>
            Welcome to DVisual
          </h1>
          <p style={{ fontSize: '1.2em', color: '#aaa', marginBottom: '30px' }}>
            A data visualization app that helps you explore and analyze sensor
            consumptions with ease.
          </p>
          <NavLink
            to="/register"
            className="btn btn-warning"
            style={{
              padding: '10px 20px',
              fontSize: '1.2em',
              textDecoration: 'none',
              borderRadius: '5px',
              backgroundColor: '#ffcc00',
              color: '#333',
              boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)',
            }}
          >
            Register
          </NavLink>
        </div>
      </section>
    </>
  );
};

export default Home;
