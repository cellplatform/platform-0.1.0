import '@platform/css/reset.css';
import './workers.init';

import React from 'react';
import ReactDOM from 'react-dom';
import { Dev } from './Dev';

/**
 * User interface.
 */
ReactDOM.render(<Dev />, document.getElementById('root'));
