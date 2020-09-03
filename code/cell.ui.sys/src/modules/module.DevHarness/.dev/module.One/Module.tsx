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

    const foo = dev
      .component('Foo')
      .label('one')
      .width(350)
      .height(250)
      .background((e) => e.RED(0.1))
      // .border((border) => border.color)
      .sidebar((e) => <div>sidebar 1</div>)
      .render((e) => <div style={{ padding: 30 }}>hello one</div>);

    const child1 = foo
      .component('Child1')
      .label('child-1')
      .height(120)
      .width(200)
      .position((pos) => pos.absolute.bottom(0).right(0))
      .render(() => <div style={{ padding: 10 }}>Child</div>);

    child1
      .component('Child2')
      .label('baba')
      .background((e) => e.RED(0.1))
      .border((e) => e.RED())
      .position((pos) => pos.absolute.bottom(0).right(0))
      .render(() => <div style={{ padding: 10 }}>Baba</div>);

    dev
      .component('Bar')
      .label('two')
      .background(-0.06)
      .position((pos) => pos.absolute.xy(60))
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
