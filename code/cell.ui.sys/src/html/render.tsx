import * as React from 'react';

import { AppBuilder } from '../components/AppBuilder';
import { Debug } from '../components/Debug';
import { Shell } from '../components/Shell';
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
        <Root title={'debug.sheet'}>
          <Debug view={'SHEET'} />
          {/* <Shell /> */}
        </Root>
      );

    case 'entry:shell':
      return (
        <Root title={'shell'}>
          <Shell />
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
