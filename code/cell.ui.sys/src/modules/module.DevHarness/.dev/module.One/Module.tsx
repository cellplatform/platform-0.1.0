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
      .sidebar((e) => <div>sidebar 1</div>)
      .render((e) => <div style={{ padding: 30 }}>hello one</div>);

    dev
      .component('Bar')
      .label('two')
      .background(-0.06)
      .width(350)
      .height(250)
      .position((pos) => pos.absolute.every(10))
      .render((e) => <div style={{ padding: 30 }}>hello two</div>);

    dev
      .component('Image')
      .label('leaf')
      .sidebar((e) => <div>sidebar leaf</div>)
      .border(0.3)
      .cropMarks(1)
      .render((e) => {
        const url = 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png';
        return <img src={url} />;
      });

    return dev.module;
  },
};
