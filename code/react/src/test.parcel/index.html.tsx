import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Test } from './components/Test';
import { reset } from '@platform/css';

reset();
ReactDOM.render(<Test />, document.getElementById('root'));
