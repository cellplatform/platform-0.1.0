import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../Dev.Harness';
import { App } from './App';

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

const isDev = query().has('dev');
const el = isDev ? <DevHarness /> : <App />;
ReactDOM.render(el, document.getElementById('root'));

if (isDev) {
  document.title = `${document.title} (dev)`;
}
