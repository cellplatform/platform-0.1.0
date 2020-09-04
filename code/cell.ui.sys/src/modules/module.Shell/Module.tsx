/* eslint-disable react/display-name */
import * as React from 'react';

import { Module, t } from './common';
import { Layout } from './components/Layout';

type P = t.ShellProps;

export const Shell: t.ShellModuleDef = {
  Layout: (props) => <Layout {...props} />,

  /**
   * Shell module initialization.
   */
  module(bus) {
    const module = Module.create<P>({ bus });
    return module;
  },
};
