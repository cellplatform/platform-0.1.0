import '@platform/css/reset.css';
import './workers.init';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../Dev.Harness';

const el = <DevHarness />;
const root = <React.StrictMode>{el}</React.StrictMode>;
ReactDOM.render(root, document.getElementById('root'));
