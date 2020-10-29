import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { bundle } from '../common';
import { Context } from '../Context';
import { App } from './App';

const env = Context.env({ host: bundle.host });
const { Provider } = Context.create({ env });

const el = (
  <Provider>
    <App />
  </Provider>
);

const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(el, root);
