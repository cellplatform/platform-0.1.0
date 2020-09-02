import * as React from 'react';

import { t } from './common';
import { Harness } from '../..';

type P = t.OneProps;

export const OneModule: t.SampleOneModuleDef = {
  /**
   * DEV: harness entry-point.
   */
  dev(bus) {
    const dev = Harness.dev(bus, 'Module One');

    dev
      .component('Foo')
      .label('one')
      .width(350)
      .height(250)
      .sidebar((e) => <div>sidebar 1</div>)
      .render((e) => <div style={{ padding: 30 }}>hello one</div>);

    dev
      .component('Foo')
      .component('Child1')
      .label('child-1')
      .height(60)
      .render(() => <div style={{ padding: 10 }}>Child</div>);

    dev
      .component('Bar')
      .label('two')
      .background(-0.06)
      .position((pos) => pos.absolute.every(60))
      .render((e) => <div style={{ padding: 30 }}>hello two</div>);

    dev
      .component('Image')
      .label('leaf')
      .sidebar((e) => <div>sidebar leaf</div>)
      .border(0.3)
      .cropmarks(1)
      .render((e) => {
        const url = 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png';
        return <img src={url} />;
      });

    return dev.module;
  },
};
