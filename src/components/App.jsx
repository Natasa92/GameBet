import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { CssBaseline, Container } from '@material-ui/core';
import Routes from './Routes';
import Header from './Header';
import '../App.css'

const App = () => (
  <>
    <CssBaseline />
    <Container>
      <SnackbarProvider maxSnack={5}>
        <BrowserRouter>
          <Header />
          <Routes />
        </BrowserRouter>
      </SnackbarProvider>
    </Container>
  </>
);

export default App;