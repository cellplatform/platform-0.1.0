import '../config';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Root } from '../components/Root';

/**
 * Render root React element.
 */
const el = <Root />;
ReactDOM.render(el, document.getElementById('root'));
