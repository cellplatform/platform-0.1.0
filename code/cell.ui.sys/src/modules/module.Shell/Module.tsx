/* eslint-disable react/display-name */
import * as React from 'react';
import { filter } from 'rxjs/operators';

import { Module, rx, t } from './common';
import { Window } from './components/Window';
import { Layout } from './components/Body';
import { strategy } from './strategy';

type P = t.ShellProps;

export const Shell: t.ShellModuleDef = {
  Window: (props) => <Window {...props} />,
  Body: (props) => <Layout {...props} />,

  /**
   * Shell module initialization.
   */
  module(bus) {
    // Setup the module.
    const shell = Module.create<P>({ bus });
    strategy({ shell, bus });

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
            Module.register(bus, child, shell);
          }
        }
      });

    // Finish up.
    return shell;
  },
};
