import '../config';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { Root } from '../components/Root';

const win = (window as unknown) as t.ITopWindow;
const env = win.env;

/**
 * Render root React element.
 */

const uri = 'cell:cka0c7a0i00004369o5ttdbt3:A1'; // TEMP 🐷

const el = <Root env={env} uri={uri} />;
ReactDOM.render(el, document.getElementById('root'));
