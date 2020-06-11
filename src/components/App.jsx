import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, Container } from '@material-ui/core';
import Routes from './Routes';
import Header from './Header';
import '../App.css'

const App = () => (
  <>
    <CssBaseline />
    <Container>
      <BrowserRouter>
        <Header />
        <Routes />
      </BrowserRouter>
    </Container>
  </>
);

export default App;