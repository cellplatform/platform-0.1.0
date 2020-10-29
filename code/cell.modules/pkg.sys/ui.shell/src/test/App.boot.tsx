import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

import { bundle, t } from '../common';
import { MemoryCache } from '@platform/cache';
import { Subject } from 'rxjs';
import { context } from '../context';

const host = bundle.host;
const def = 'cell:foo:A1';
const cache = MemoryCache.create();
const event$ = new Subject<t.Event>();
const env: t.IEnv = { host, def, cache, event$ };

const { Provider } = context.create({ env });

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.body.appendChild(document.createElement('div')),
);
