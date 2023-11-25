import React from 'react';
import Navbar from './component/Navbar';
import { Switch, Route } from 'react-router-dom';
import Home from './component/Home';
import Login from './component/Login';
import Register from './component/Register';
import Profile from './component/Profile';
import Logout from './component/Logout';
import Visualize from './component/Visualise';
import './App.css';

const App = () => {
  return (
    <>
    <Navbar/>
    <Switch>
      <Route exact path ="/" component={Home}/>
      <Route exact path ="/login" component={Login}/>
      <Route exact path ="/register" component={Register}/>
      <Route exact path ="/profile" component={Profile}/>
      <Route exact path ="/logout" component={Logout}/>
      <Route path="/visualize/:siteId" render={(props) => <Visualize siteId={props.match.params.siteId} />} />
    </Switch>
     

    </>
  )
}

export default App;



