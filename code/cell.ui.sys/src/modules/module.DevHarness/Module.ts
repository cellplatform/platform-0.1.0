import { Module } from './common';
import { dev } from './language';
import { strategy } from './strategy';
import * as t from './types';

type P = t.HarnessProps;

export const Harness: t.HarnessDef = {
  /**
   * Development module builder (DSL).
   */
  dev,

  /**
   * Harness module initialization.
   */
  module(bus, options = {}) {
    // Setup the module.
    const harness = Module.create<P>({ bus, root: 'harness' });
    strategy({ harness, bus });

    // Register the harness within a containing <Shell>.
    if (options.register) {
      const parent = options.register === true ? undefined : options.register?.parent;
      const res = Module.register(bus, harness, parent);
      if (res.parent) {
        harness.change((draft) => {
          const shell = res.parent?.id || '';
          const props = draft.props || (draft.props = {});
          const data = (props.data ||
            (props.data = { kind: 'harness.root', shell })) as t.HarnessDataRoot;
          data.shell = shell;
        });
      }
    }

    // Finish up.
    return harness;
  },
};
