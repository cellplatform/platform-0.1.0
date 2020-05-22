import '@platform/polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './global';
import { Test } from './Test';

ReactDOM.render(<Test />, document.getElementById('root'));
