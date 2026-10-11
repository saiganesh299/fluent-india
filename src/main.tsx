import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { DemoDataProvider } from './context/DemoDataContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DemoDataProvider>
        <App />
      </DemoDataProvider>
    </BrowserRouter>
  </React.StrictMode>
);
