import '../config';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t, Schema } from '../common';
import { Root } from '../components/Root';

const win = (window as unknown) as t.ITopWindow;
const env = win.env;

const uri = 'cell:cka4fys2300004369vvwe48bx:A1'; // TEMP 🐷

/**
 * Render root element.
 */
const el = <Root env={env} uri={uri} />;
ReactDOM.render(el, document.getElementById('root'));
