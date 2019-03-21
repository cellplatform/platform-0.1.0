import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import * as React from 'react';

import { DragTest } from './DragTest';

export class Test extends React.PureComponent {
  public render() {
    return <DragTest style={{ Absolute: 30 }} />;
  }
}
