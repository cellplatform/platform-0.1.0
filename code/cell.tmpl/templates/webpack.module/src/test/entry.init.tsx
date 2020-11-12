import '@platform/css/reset.css';
import './workers.init';

import React from 'react';
import ReactDOM from 'react-dom';
import { Dev } from './components/Dev';

const root = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<Dev />, root);
