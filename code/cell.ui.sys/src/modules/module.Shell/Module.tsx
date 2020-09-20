/* eslint-disable react/display-name */
import * as React from 'react';

import { Module, t } from './common';
import { Layout } from './components/Body';
import { Window } from './components/Window';
import { strategy } from './strategy';
import { ShellBuilder } from './language';

type P = t.ShellProps;

export const Shell: t.Shell = {
  Window: (props) => <Window {...props} />,
  Body: (props) => <Layout {...props} />,

  /**
   * Shell module initialization.
   */
  module(bus, options: t.ShellOptions = {}) {
    const shell = Module.create<P>({ bus });
    strategy({ ...options, shell, bus });
    return shell;
  },

  // TEMP 🐷
  builder: ShellBuilder.builder,
};
