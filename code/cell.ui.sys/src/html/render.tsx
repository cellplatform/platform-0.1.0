import * as React from 'react';

import { AppBuilder } from '../components/AppBuilder';
import { Test as ModuleView } from '../components.dev/ModuleView.dev/Test';
import { Shell } from '../modules/module.Shell';
import { Root } from '../components/Root';
import { Harness } from '../modules/module.DevHarness';

export function render(entry: string) {
  if (entry === 'entry:harness') {
    return (
      <Shell.Window theme={'WHITE'} onLoaded={(bus) => Harness.module(bus, { register: true })} />
    );
  }

  if (entry === 'entry:shell') {
    return (
      <Root title={'ModuleView'}>
        <ModuleView />
      </Root>
    );
  }

  return (
    <Root>
      <AppBuilder />
    </Root>
  );
}
