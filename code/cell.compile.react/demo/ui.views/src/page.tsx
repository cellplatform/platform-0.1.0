import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Foo } from './component';
import './styles';

console.log('👋');
console.log('👋 console.log():');
console.log('👋   Hello World!');
console.log('👋');

/**
 * Dynamically load a module (aka: "code-splitting").
 */
setTimeout(() => {
  const load = import('./m');
  load.then(e => {
    console.log('-------------------------------------------');
    console.log('Dynamically loaded module:', e);
    e.init();
  });
}, 2000);
console.log('waiting (2s)...');

/**
 * Render root React element.
 */
ReactDOM.render(<Foo />, document.getElementById('root'));
