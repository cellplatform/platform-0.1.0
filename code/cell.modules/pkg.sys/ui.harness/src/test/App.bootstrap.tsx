import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

import '@platform/css/reset.css';

const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<App />, root);
