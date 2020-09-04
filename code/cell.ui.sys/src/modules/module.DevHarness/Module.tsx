/* eslint-disable react/display-name */
import * as React from 'react';

import { Module } from './common';
import { Layout } from './components/Layout';
import { dev } from './language';
import { strategy } from './strategy';
import * as t from './types';

type P = t.HarnessProps;

export const Harness: t.HarnessDef = {
  Layout: (props) => <Layout {...props} />,

  /**
   * Development module builder (DSL).
   */
  dev,

  /**
   * Harness module initialization.
   */
  module(bus) {
    const harness = Module.create<P>({ bus });
    strategy({ harness, bus });
    return harness;
  },
};
