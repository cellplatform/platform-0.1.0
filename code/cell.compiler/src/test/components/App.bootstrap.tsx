import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

const root = document.body.appendChild(document.createElement('div'));
const el = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
ReactDOM.render(el, root);
