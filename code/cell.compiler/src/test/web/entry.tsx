import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './components/App';
import Worker from 'worker-loader?inline=no-fallback!./web.worker';

/**
 * React
 */
const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<App />, root);
console.log('React.version:', React.version);

/**
 * Webworker
 */
const worker = new Worker();

worker.onmessage = function (e: MessageEvent<any>) {
  console.log('🌼 event (from worker thread)', e.data);
};

setTimeout(() => {
  worker.postMessage({ msg: 'Hello from [App.entry.tsx]' });
}, 500);
