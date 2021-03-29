import * as React from 'react';

import { t } from '../common';
import { Test as ModuleView } from '../components.dev/ModuleView.dev/Test';
import { AppBuilder } from '../components/AppBuilder';
import { Root } from '../components/Root';
import { Harness } from '../modules/module.DevHarness';
import { SAMPLE as DevHarness_SAMPLE } from '../modules/module.DevHarness/.dev/SAMPLE';
import { Shell } from '../modules/module.Shell';

const onLoaded = (bus: t.EventBus) => {
  console.log('Loaded:', `<Shell.Window>`);
  Harness.module(bus, { register: true });
  DevHarness_SAMPLE(bus);
};

export function render(entry: string) {
  if (entry === 'entry:harness') {
    return <Shell.Window theme={'WHITE'} onLoaded={onLoaded} acceptNakedRegistrations={true} />;
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
