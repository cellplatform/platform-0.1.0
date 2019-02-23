import '@babel/polyfill';
import '../node_modules/@uiharness/electron/css/normalize.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Test } from '../src/components/Test';

ReactDOM.render(<Test />, document.getElementById('root'));
