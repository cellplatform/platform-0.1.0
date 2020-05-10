import '../config';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { Root } from '../components/Root';

const win = (window as unknown) as t.ITopWindow;
const env = win.env;

const uri = 'cell:sys.foo:A1'; // TEMP 🐷

/**
 * Render root React element.
 */
const el = <Root env={env} uri={uri} />;
ReactDOM.render(el, document.getElementById('root'));
