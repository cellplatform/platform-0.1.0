import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ViewsIndex as Index } from './components/ViewsIndex';
import { LoadSplash } from './components/LoadSplash';
import { VIEWS, load } from './views';
import './styles/global';

console.log('👋');
console.log('👋 CellOS Views:');
console.log('👋   Hello World!');
console.log('👋');

/**
 * Render root React element.
 */
// const el = <Index views={VIEWS} />;
const el = <LoadSplash />;
// const el = <div />;
ReactDOM.render(el, document.getElementById('root'));

// TEMP 🐷
load(VIEWS[0]);
