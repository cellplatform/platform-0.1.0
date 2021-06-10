import '@platform/css/reset.css';
import './workers.init';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../Dev.Harness';

const el = <DevHarness />;
ReactDOM.render(el, document.getElementById('root'));
