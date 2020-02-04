import '@platform/polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TestGrid } from '../components/Test.Grid';

const el = <TestGrid left={false} editorType={'default'} />;
ReactDOM.render(el, document.getElementById('root'));
