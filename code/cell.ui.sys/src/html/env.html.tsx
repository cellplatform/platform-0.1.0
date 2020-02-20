import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Root } from '../components/Root';
import { loader } from '../loader';

loader.init();
ReactDOM.render(<Root />, document.getElementById('root'));
