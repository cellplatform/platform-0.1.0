import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Test } from './components/Test';

ReactDOM.render(<Test />, document.getElementById('root'));
document.body.style.overflow = 'hidden'; // Prevent rubber-band.
