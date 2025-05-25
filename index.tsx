
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
<<<<<<< HEAD
=======
import { AppProvider } from './contexts/AppContext';
>>>>>>> 88260e65f84fd5b0bc475028cd30d2c3bc2c24af

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
<<<<<<< HEAD
    <App />
=======
    <AppProvider>
      <App />
    </AppProvider>
>>>>>>> 88260e65f84fd5b0bc475028cd30d2c3bc2c24af
  </React.StrictMode>
);
