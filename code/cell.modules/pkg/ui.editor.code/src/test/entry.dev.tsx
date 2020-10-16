import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CodeEditor } from '../components/CodeEditor';

const root = document.body.appendChild(document.createElement('div'));
const el = (
  <React.StrictMode>
    <CodeEditor />
  </React.StrictMode>
);

ReactDOM.render(el, root);
