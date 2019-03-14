import '@babel/polyfill';
import '../node_modules/@platform/css/reset.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Test } from '../src/components/Test';

ReactDOM.render(<Test />, document.getElementById('root'));
