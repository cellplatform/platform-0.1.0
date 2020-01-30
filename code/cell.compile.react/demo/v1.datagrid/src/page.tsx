import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { GridScreen } from './components/GridScreen';

/**
 * Render root React element.
 */
const app = <GridScreen />;
ReactDOM.render(app, document.getElementById('root'));
