import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../Dev.Harness';
import { DevSampleApp } from '../web.ui/dev.Sample.App';

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
const el = isDev ? <DevHarness /> : <DevSampleApp />;
ReactDOM.render(el, document.getElementById('root'));

if (isDev) {
  document.title = `${document.title} (dev)`;
}
