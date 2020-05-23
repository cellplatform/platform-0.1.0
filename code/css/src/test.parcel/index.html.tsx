import '@platform/polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './styles';
import { Test } from './Test';
import { reset } from '../reset';

reset();
ReactDOM.render(<Test />, document.getElementById('root'));
