import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './components/App';
import './workers/init';

/**
 * React
 */
ReactDOM.render(<App />, document.getElementById('root'));
console.log('React.version:', React.version);
