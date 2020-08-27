import * as React from 'react';

import { Module } from './common';
import { Main } from './components/Main';
import { strategy } from './Module.strategy';
import * as t from './types';

type P = t.HarnessProps;

export const HarnessModule: t.HarnessModuleDef = {
  View: (props) => <Main {...props} />, // eslint-disable-line

  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus) {
    const harness = Module.create<P>({ bus });
    strategy({ harness, bus });
    return harness;
  },
};
