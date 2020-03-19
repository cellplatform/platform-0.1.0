import '@platform/polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './components/App';

import './styles/global';

/**
 * Render root React element.
 */
ReactDOM.render(<App />, document.getElementById('root'));

// const server = init();
