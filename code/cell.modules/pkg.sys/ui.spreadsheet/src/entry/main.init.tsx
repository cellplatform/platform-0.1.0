import '@platform/css/reset.css';
import './workers.init';

import React from 'react';
import ReactDOM from 'react-dom';
import { Dev } from '../components/Dev';

const el = <Dev />;
const root = <React.StrictMode>{el}</React.StrictMode>;

ReactDOM.render(root, document.getElementById('root'));
