import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes';
import Header from './Header';

const App = () => (
  <BrowserRouter>
    <Header />
    <Routes />
  </BrowserRouter>
);

export default App;