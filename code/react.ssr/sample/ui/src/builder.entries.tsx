import * as React from 'react';
import { Main } from './components/Main';

/**
 * SSR initial HTML
 */
const entries = [{ file: 'index.html', el: <Main /> }];
export default entries;
