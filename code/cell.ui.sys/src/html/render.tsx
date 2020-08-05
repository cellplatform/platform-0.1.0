import * as React from 'react';

import { AppBuilder } from '../components/AppBuilder';
import { Debug } from '../components/Debug';
import { Test as ShellTest } from '../components/Shell/Test';
import { Test as ModuleViewTest } from '../components/ModuleView/Test';
import { Root } from '../components/Root';

export function render(entry: string) {
  switch (entry) {
    case 'entry:debug':
      return (
        <Root title={'debug.log'}>
          <Debug view={'LOG'} />
        </Root>
      );

    case 'entry:debug.sheet':
      return (
        <Root title={'shell'}>
          <ShellTest />
        </Root>
        // <Root title={'debug.sheet'}>
        //   <Debug view={'SHEET'} />
        // </Root>
      );

    case 'entry:shell':
      return (
        <Root title={'ModuleView'}>
          <ModuleViewTest />
        </Root>
      );

    default:
      return (
        <Root>
          <AppBuilder />
        </Root>
      );
  }
}
