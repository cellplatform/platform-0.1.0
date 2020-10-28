import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

console.log('React.version:', React.version);

try {
  // @ts-ignore
  console.log('__CELL_ENV__', __CELL_ENV__);
} catch (error) {
  console.log('error', error);
}

const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<App />, root);
