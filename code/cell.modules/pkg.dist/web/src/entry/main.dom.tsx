import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../Dev.Harness';
import { App } from '../ui/App';
import { rx } from '../common';

const query = () => {
  const url = new URL(location.href);
  const q = url.searchParams;
  if (q.has('dev')) return q;

  if (q.has('d')) {
    q.set('dev', q.get('d') || '');
    q.delete('d');
    window.history.pushState({}, '', url);
  }

  return q;
};

/**
 * UI
 */

const bus = rx.bus();
const instance = { bus, id: 'main' };

const isDev = query().has('dev');
const el = isDev ? <DevHarness /> : <App instance={instance} style={{ Absolute: 0 }} />;
ReactDOM.render(el, document.getElementById('root'));

/**
 * Page Title
 */
if (isDev) document.title = `${document.title} (dev)`;
