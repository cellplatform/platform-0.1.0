import * as React from 'react';

import { Module, t } from './common';
import { Dev } from '../..';

type P = t.OneProps;

export const OneModule: t.SampleOneModuleDef = {
  /**
   * DEV: harness entry point.
   */
  dev(bus) {
    const dev = Dev(bus, 'One');

    dev.component('one').render((e) => <div style={{ padding: 30 }}>hello one</div>);

    dev
      .component('two')
      .width(350)
      .height(250)
      .render((e) => <div style={{ padding: 30 }}>hello two</div>);

    dev.component('leaf').render((e) => {
      const url = 'https://tdb.sfo2.digitaloceanspaces.com/tmp/leaf.png';
      return <img src={url} />;
    });

    return dev.module;
  },
};
