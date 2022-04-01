import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import './app.css';
import { KaTeX } from './katex';

import { Main } from './main';

const Header = () => (
  <header>
    <h1>
      The OVL-<KaTeX text='q' /> Test
    </h1>
  </header>
);

const Footer = () => (
  <footer>
    <p>The source code used in this page is published <a href='https://github.com/fiveseven-lambda/OVL-test'>here</a>, under the GPLv3 license.</p>
    <p>© 2022 Atsushi Komaba</p>
  </footer>
);

let root = ReactDOMClient.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Header />
    <Main />
    <Footer />
  </React.StrictMode>
);