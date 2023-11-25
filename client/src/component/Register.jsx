import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';


const Register = () => {
  const [user, setUser] = useState({
    email: '',
    password: '',
    organisationname: '', // Only include the organization name
  });

  const [msg, setMsg] = useState('');
  const history = useHistory();
  axios.defaults.withCredentials = true;

  const onSub = async (e) => {
    e.preventDefault();
    // Include only the organization name in the user object
    const userData = {
      email: user.email,
      password: user.password,
      organisationname: user.organisationname,
    };

    let response = await axios.post('https://dvisual-deployment.vercel.app/register', userData);

    if (response.data.msg) {
      setMsg(response.data.msg);
    } else {
      history.push('/login');
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      let response = await axios.get('https://dvisual-deployment.vercel.app/login');

      if (response.data.user) {
        history.push('/profile');
      }
    };
    checkLogin();
  }, []);

  const userInput = (event) => {
    const { name, value } = event.target;
    setUser((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  return (
    <>
      <div
        className="container"
        id="formm"
        style={{
          backgroundColor: 'black', // Dark background color
          color: 'white', // Light text color
        }}
      >
        <div className="row">
          <div className="col-lg-6 col-md-8 col-12 mx-auto">
            {msg ? (
              <>
                <div className="alert alert-danger alert-dismissible">
                  <button type="button" className="close" data-dismiss="alert">
                    &times;
                  </button>
                  <strong>ERROR!</strong> {msg}
                </div>
              </>
            ) : null}
            <br />
            <form onSubmit={onSub}>
              <div className="form-group">
                <label>Email address:</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  name="email"
                  value={user.email}
                  onChange={userInput}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  name="password"
                  value={user.password}
                  onChange={userInput}
                  required
                />
              </div>
              <div className="form-group">
                <label>Organisation Name:</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter organization name"
                  name="organisationname"
                  value={user.organisationname}
                  onChange={userInput}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
