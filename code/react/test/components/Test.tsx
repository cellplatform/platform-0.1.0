import '../../node_modules/@platform/css/reset.css';
import '@babel/polyfill';

import { Button, ObjectView } from '@uiharness/ui';
import * as React from 'react';

import { Test as DragTest } from '../../src/drag/Test';

export class Test extends React.PureComponent {
  public render() {
    return <DragTest style={{ Absolute: 30 }} />;
  }
}
