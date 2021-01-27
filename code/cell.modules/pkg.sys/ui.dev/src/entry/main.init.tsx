import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Dev } from '../test/Dev';

const el = <Dev />;
const root = <React.StrictMode>{el}</React.StrictMode>;

ReactDOM.render(root, document.getElementById('root'));
