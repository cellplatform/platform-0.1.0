import * as React from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue, time, ui, StateObject } from '../../common';
import { Icons } from '../../components/primitives';
import { ComponentFrame } from './ComponentFrame';
import { TestKong } from './Test.Kong';
import { TestDiagram } from './Test.Diagram';

import * as t from './types';

const { Module, ModuleView } = ui;

/**
 * Render factory.
 */
export function factory(args: {
  fire: t.FireEvent<any>;
  event$: Observable<t.Event>;
  until$: Observable<any>;
}) {
  const events = Module.events(args.event$, args.until$);

  const RootProvider = Module.provider<t.MyContext>({
    event$: events.$,
    fire: args.fire,
  });

  events.render$.subscribe((e) => {
    console.log('e', e);
    e.render(<div>hello</div>);

    // if (e.module === foo.id) {
    //   const el = (
    //     <RootProvider>
    //       <TestDiagram />
    //     </RootProvider>
    //   );
    //   e.render(el);
    // }
    // if (e.module === bar.id) {
    //   const el = (
    //     <RootProvider>
    //       <TestKong e={e} module={bar.id} />
    //     </RootProvider>
    //   );
    //   e.render(el);
    // }
  });
}
