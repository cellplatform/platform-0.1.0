import '@platform/css/reset.css';
import './web.workers.init';

import React from 'react';
import ReactDOM from 'react-dom';
import { Dev } from './components/Dev';

ReactDOM.render(<Dev />, document.getElementById('root'));
