/* eslint-disable react/display-name */
import * as React from 'react';

import { Module, t, id, constants } from './common';
import { Layout } from './components/Body';
import { Window } from './components/Window';
import { strategy } from './strategy';
import { builder } from './language';

type P = t.ShellProps;

export const Shell: t.Shell = {
  Window: (props) => <Window {...props} />,
  Body: (props) => <Layout {...props} />,

  /**
   * Shell module initialization.
   */
  module(bus, options: t.ShellOptions = {}) {
    const kind = constants.KIND;
    const shell = Module.create<P>({ bus, kind, root: `${id.shortid()}.shell` });
    strategy({ ...options, shell, bus });
    return shell;
  },

  /**
   * API builder (DSL).
   */
  builder,
};
