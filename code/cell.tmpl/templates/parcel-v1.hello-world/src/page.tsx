import * as React from 'react';
import * as ReactDOM from 'react-dom';

console.log('👋');
console.log('👋   Hello World!');
console.log('👋');

/**
 * Render root React element.
 */
const el = <div style={{ fontSize: 50, margin: 30 }}>Hello World!</div>;
ReactDOM.render(el, document.getElementById('root'));
