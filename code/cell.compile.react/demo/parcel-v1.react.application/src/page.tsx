import { css } from '@platform/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Foo } from './component';

const f = import('./m');
f.then(e => {
  console.log('-------------------------------------------');
  console.log('Dynamically loaded module:', e);
});

// Setup global styles.
css.global({
  body: {
    fontFamily: 'sans-serif',
    padding: 25,
  },
  h1: {
    fontSize: 64,
    margin: 0,
  },
});

// Render root react element.
const app = <Foo />;
ReactDOM.render(app, document.getElementById('root'));
