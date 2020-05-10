import '../config';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { Root } from '../components/Root';
import { monaco } from '@monaco-editor/react';
import { configure } from '../components/Monaco.config';

const win = (window as unknown) as t.ITopWindow;
const env = win.env;

const uri = 'cell:sys.foo:A1'; // TEMP 🐷

monaco.init().then(async monaco => {
  // Perform initial setup of the code-editior.
  configure.theme(monaco);
  configure.language(monaco);

  // Render root React element.
  const el = <Root env={env} uri={uri} />;
  ReactDOM.render(el, document.getElementById('root'));
});
