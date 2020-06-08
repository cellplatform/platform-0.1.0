import '../config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
// import { Root } from '../components/Root';
import { Window } from '../components/Window';

const win = (window as unknown) as t.ITopWindow;
const env = win.env;

(async () => {
  // env.event$.subscribe((e) => {
  //   console.log('module  | 🌳 event', e);
  //   // writeRow()
  // });
  const el = <Window />;

  // const el = <Root env={env} uri={env.def} />;
  ReactDOM.render(el, document.getElementById('root'));
})();
