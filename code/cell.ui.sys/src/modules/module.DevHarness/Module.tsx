/* eslint-disable react/display-name */

import * as React from 'react';
import { Dev as dev } from './api';

import { Module } from './common';
import { Layout } from './components/Layout';
import { strategy } from './strategy';
import * as t from './types';

type P = t.HarnessProps;

export const Harness: t.HarnessDef = {
  Layout: (props) => <Layout {...props} />,

  /**
   * Module initialization
   */
  dev,

  /**
   * ENTRY: Initialize a new module from the definition.
   */
  module(bus) {
    const harness = Module.create<P>({ bus });
    strategy({ harness, bus });
    return harness;
  },
};
