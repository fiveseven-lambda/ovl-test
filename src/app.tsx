import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './app.css';
import { KaTeX } from './katex';

import { Main } from './main';

const Header = () => (
  <h1 className='part header'>The OVL-<KaTeX text='q' /> Test</h1>
);

const Footer = () => (
  <p className='footer'>copyright</p>
);

let root = ReactDOMClient.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Header />
    <Main />
    <Footer />
  </React.StrictMode>
);