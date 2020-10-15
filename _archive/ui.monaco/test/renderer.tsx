import '@platform/polyfill';
import '../node_modules/@platform/css/reset.css';

import * as React from 'react';
import { renderer } from '../src/common/renderer';
import { Test } from '../src/components/Editor/Test';

// workaround monaco-css not understanding the environment
// (self as any).module = undefined;

const el = <Test />;
renderer.render(el, 'root');
