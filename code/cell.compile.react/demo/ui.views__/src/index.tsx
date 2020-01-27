import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './styles';
import { ViewIndex } from './components/ViewIndex';

/**
 * Render root React element.
 */
const app = <ViewIndex />;
ReactDOM.render(app, document.getElementById('root'));
