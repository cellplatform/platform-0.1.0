import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Foo } from './component';
import './styles';

/**
 * Dynamically load a module (aka: "code-splitting").
 */
const load = import('./m');
load.then(e => {
  console.log('-------------------------------------------');
  console.log('Dynamically loaded module:', e);
});

/**
 * Render root React element.
 */
const app = <Foo />;
ReactDOM.render(app, document.getElementById('root'));
