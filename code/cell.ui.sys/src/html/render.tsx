import * as React from 'react';

import { AppBuilder } from '../components/AppBuilder';
import { Test as ModuleView } from '../components.dev/ModuleView.dev/Test';
import { Root } from '../components/Root';
import { HarnessModule } from '../modules/module.Harness';

export function render(entry: string) {
  switch (entry) {
    // case 'entry:debug':
    // return (
    //   <Root title={'debug.log'}>
    //     <Debug view={'LOG'} />
    //   </Root>
    // );

    case 'entry:harness':
      return (
        <Root title={'ui.harness'} theme={'WHITE'}>
          <HarnessModule.View />
        </Root>
      );

    case 'entry:shell':
      return (
        <Root title={'ModuleView'}>
          <ModuleView />
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
