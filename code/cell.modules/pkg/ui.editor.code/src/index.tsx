import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Editor } from './components/Editor';

const root = document.body.appendChild(document.createElement('div'));
const el = (
  <React.StrictMode>
    <Editor />
  </React.StrictMode>
);

ReactDOM.render(el, root);
