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
  module(bus, options = {}) {
    // Setup the DevHarness module.
    const harness = Module.create<P>({ bus, root: 'harness' });
    strategy({ harness, bus });

    // Register the harness within a containing <Shell>.
    if (options.register) {
      const parent = options.register === true ? undefined : options.register?.parent;
      const res = Module.register(bus, harness, parent);
      if (res.parent) {
        harness.change((draft) => {
          const props = draft.props || (draft.props = {});
          const data = props.data || (props.data = {});
          data.shell = res.parent?.id;
        });
      }
    }

    // Finish up.
    return harness;
  },
};
