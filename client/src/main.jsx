import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <OrgProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </OrgProvider>
    </AuthProvider>
  </React.StrictMode>
);
