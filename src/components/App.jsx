import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Container } from 'semantic-ui-react';
import Routes from './Routes';
import Header from './Header';
import '../App.css'

const App = () => (
  <Container>
    <BrowserRouter>
      <Header />
      <Routes />
    </BrowserRouter>
  </Container>
);

export default App;