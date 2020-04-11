import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Schema } from '../common';
import { loader } from '../loader';

Schema.uri.ALLOW.NS = [...Schema.uri.ALLOW.NS, 'sys*'];

(async () => {
  loader.init();
  const Root = (await loader.root()).Root;
  ReactDOM.render(<Root />, document.getElementById('root'));
})();
