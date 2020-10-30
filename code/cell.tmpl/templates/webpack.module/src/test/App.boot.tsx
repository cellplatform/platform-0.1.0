import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<App />, root);
