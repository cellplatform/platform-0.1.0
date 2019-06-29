import '@platform/libs/polyfill';
import '../node_modules/@platform/css/reset.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from '../src/components/Editor/Test';

const el = <Test />;
ReactDOM.render(el, document.getElementById('root'));
