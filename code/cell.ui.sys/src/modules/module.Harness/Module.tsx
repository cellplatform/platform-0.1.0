import * as React from 'react';
import { Dev as dev } from './api';

import { Module } from './common';
import { Main } from './components/Main';
import { strategy } from './strategy';
import * as t from './types';

type P = t.HarnessProps;

export const Harness: t.HarnessDef = {
  View: (props) => <Main {...props} />, // eslint-disable-line
  dev,

  /**
   * ENTRY: Initialize a new module from the definition.
   */
  init(bus) {
    const harness = Module.create<P>({ bus });
    strategy({ harness, bus });
    return harness;
  },
};
