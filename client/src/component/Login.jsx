import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import axios from 'axios';



const Login = () => {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });

  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');

  const history = useHistory();

  const onSubmit = async (e) => {
    e.preventDefault();
    let response = await axios.post('https://dvisual-deployment.vercel.app/login', user, { withCredentials: true });
    setShow(response.data.login);
    if (response.data.msg) {
      setMsg(response.data.msg);
    }
  };

  useEffect(() => {
    if (show) {
      history.push('/profile');
    }
  }, [show, history]);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkLogin = async () => {
      let response = await axios.get('https://dvisual-deployment.vercel.app/login');
      if (response.data.user) {
        history.push('/profile');
      }
    };
    checkLogin();
  }, [history]);

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
      <div className="container" id="formm">
        <div className="row">
          <div className="col-lg-6 col-md-8 col-12 mx-auto">
            {msg ? (
              <div className="alert alert-danger alert-dismissible">
                <button type="button" className="close" data-dismiss="alert">
                  &times;
                </button>
                <strong>ERROR!</strong> {msg}
              </div>
            ) : null}
            <br />
            <form onSubmit={onSubmit}>
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

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>
            <br />
            <NavLink to="/register" className="text-light">
              Create an account
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
