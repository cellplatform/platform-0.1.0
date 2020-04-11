import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Root } from '../components/Root';
import { Schema } from '../common';
import { loader } from '../loader';

Schema.uri.ALLOW.NS = [...Schema.uri.ALLOW.NS, 'sys*'];

loader.init();
ReactDOM.render(<Root />, document.getElementById('root'));
