import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Root } from '../components/Root';
import { loader } from '../loader';

import { Schema } from '../common';
Schema.uri.ALLOW.NS = [...Schema.uri.ALLOW.NS, 'sys*'];

loader.init();
console.log('loader', loader);

(async () => {
  const Root = (await loader.root()).Root;
  // console.log('el', el);
  ReactDOM.render(<Root />, document.getElementById('root'));
})();
