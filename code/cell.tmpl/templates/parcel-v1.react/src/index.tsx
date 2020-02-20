import '@platform/polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './styles/global';

console.log('👋');
console.log('👋   Hello World!');
console.log('👋');

/**
 * Render root React element.
 */
const el = <div>Hello World!</div>;
ReactDOM.render(el, document.getElementById('root'));
