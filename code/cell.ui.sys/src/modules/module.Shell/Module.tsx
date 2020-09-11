/* eslint-disable react/display-name */
import * as React from 'react';

import { Module, t } from './common';
import { Layout } from './components/Body';
import { Window } from './components/Window';
import { strategy } from './strategy';

type P = t.ShellProps;

export const Shell: t.ShellModuleDef = {
  Window: (props) => <Window {...props} />,
  Body: (props) => <Layout {...props} />,

  /**
   * Shell module initialization.
   */
  module(bus, options: t.ShellModuleDefOptions = {}) {
    const shell = Module.create<P>({ bus });
    strategy({ ...options, shell, bus });
    return shell;
  },
};
