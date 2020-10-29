import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

console.log('React.version:', React.version);

const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<App />, root);
