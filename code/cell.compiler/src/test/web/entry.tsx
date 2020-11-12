import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './components/App';
import './workers/init';

/**
 * React
 */
const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<App />, root);
console.log('React.version:', React.version);
