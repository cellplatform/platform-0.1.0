/* eslint-disable react/display-name */
import * as React from 'react';
import { filter } from 'rxjs/operators';

import { Module, rx, t } from './common';
import { Window } from './components/Window';
import { Layout } from './components/Body';

type P = t.ShellProps;

export const Shell: t.ShellModuleDef = {
  Window: (props) => <Window {...props} />,
  Body: (props) => <Layout {...props} />,

  /**
   * Shell module initialization.
   */
  module(bus) {
    const module = Module.create<P>({ bus });
    const fire = Module.fire<P>(bus);

    /**
     * Catch "naked" registrations (where no explicit parent is specified)
     * and insert them into the shell.
     */
    rx.payload<t.IModuleRegisterEvent>(bus.event$, 'Module/register')
      .pipe(filter((e) => !e.parent))
      .subscribe((e) => {
        if (!e.parent) {
          const child = fire.request(e.module);
          if (child) {
            Module.register(bus, child, module);
          }
        }
      });

    // Finish up.
    return module;
  },
};
