import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom"
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from "./store/redux.js"

const theme = createTheme({})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <Notifications />
        <Router>
          <App />
        </Router>
      </MantineProvider>
    </Provider>
  </StrictMode>
)
