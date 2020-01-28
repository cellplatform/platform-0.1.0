import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ViewsIndex as Index } from './components/ViewsIndex';
import { VIEWS } from './views';
import './styles';

console.log('👋');
console.log('👋 CellOS View:');
console.log('👋   Hello World!');
console.log('👋');

/**
 * Render root React element.
 */
const el = <Index views={VIEWS} />;
ReactDOM.render(el, document.getElementById('root'));
