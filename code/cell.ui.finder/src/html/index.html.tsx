import '../config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { Root } from '../components/Finder.Root';
import { createContext } from './ctx';
import { behavior } from '../behavior';

const win = (window as unknown) as t.ITopWindow;
const env = win.env;

const ctx = createContext({ env });

/**
 * Render root React element.
 */

behavior(ctx);
// console.log('event$', event$);

const el = <Root env={env} ctx={ctx} />;
ReactDOM.render(el, document.getElementById('root'));
