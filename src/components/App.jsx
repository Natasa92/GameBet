import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { CssBaseline, Container } from '@material-ui/core';
import BaseApp from './BaseApp';
import '../App.css'

const App = () => (
  <>
    <CssBaseline />
    <Container>
      <SnackbarProvider maxSnack={5}>
        <BrowserRouter>
          <BaseApp />
        </BrowserRouter>
      </SnackbarProvider>
    </Container>
  </>
);

export default App;