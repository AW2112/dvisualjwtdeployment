import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';


const Navbar = () => {
  const [login, setLogin] = useState(false);
  const [forceRender, setForceRender] = useState(false);
  axios.defaults.withCredentials = true;
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('https://dvisual-deployment.vercel.app/login');
        setLogin(response.data.login);
        setForceRender(prev => !prev); // Force a re-render
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
  
    checkLogin();
  }, [forceRender]); // Re-run the effect when forceRender changes

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            Dvisual
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ml-auto ">
              <li className="nav-item active">
                <NavLink to="/" className="nav-link">
                  Home
                </NavLink>
              </li>
              <li className="nav-item active">
                {!login ? (
                  <>
                    <NavLink to="/login" className="nav-link">
                      Login
                    </NavLink>
                  </>
                ) : (
                  <NavLink to="/logout" className="nav-link">
                    LogOut
                  </NavLink>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

