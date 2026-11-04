import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { VeiculoProvider } from './context/VeiculoContext';
import './styles/global.css';

// Antecipa comportamentos do React Router 7 (evita avisos no console).
const FLAGS_ROTEADOR = { v7_startTransition: true, v7_relativeSplatPath: true };

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={FLAGS_ROTEADOR}>
      <VeiculoProvider>
        <App />
      </VeiculoProvider>
    </BrowserRouter>
  </React.StrictMode>
);
