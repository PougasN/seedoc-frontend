import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Patients from './components/Patients';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Patients} />
      </Switch>
    </Router>
  );
}

export default App;
