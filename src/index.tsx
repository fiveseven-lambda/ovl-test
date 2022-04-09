import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './style.css';
import { App } from './app';

ReactDOMClient
  .createRoot(document.getElementById('root'))
  .render(
    <React.StrictMode>
      <App/>
    </React.StrictMode>
  );