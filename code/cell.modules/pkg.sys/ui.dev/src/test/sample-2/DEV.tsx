import React from 'react';

import { ActionsFactory } from '../..';
import { t, rx } from '../../common';
import { DevDefs, DisplayDefs } from '../../defs';
import { Component } from './Component';

type O = Record<string, unknown>;

type Ctx = {
  bus: t.EventBus<any>;
  count: number;
  el?: JSX.Element;
};

type M = t.DevMethods<Ctx> & t.DisplayMethods<Ctx>;

/**
 * NOTE: This demonstrates the process of Action composition.
 *
 *       This is the same as importing the "pre-canned"
 *       [DevActions] function.
 *
 *       The is an extensibility hook, allowing different sets of
 *       tools to be assembled for different uses of the harness.
 */
const ComposedActions = <Ctx extends O>() =>
  ActionsFactory.compose<Ctx, M>([...DevDefs, ...DisplayDefs]);

/**
 * Actions
 */
export const actions = ComposedActions<Ctx>()
  .namespace('test/sample-2')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      bus: rx.bus(), // NB: Dummy, replaced with injected bus in [init] method.
      count: 0,
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;

    ctx.count = 123;
    ctx.bus = e.bus;

    bus.$.subscribe((e) => {
      console.log('$.event:', e);
    });
  })

  .items((e) => {
    e.button('increment', (e) => e.ctx.count++);
    e.button('fire (bus)', (e) => {
      e.ctx.bus.fire({
        type: 'foo',
        payload: { count: e.ctx.count },
      });
    });
    e.hr();

    e.title('My Title');
    e.button('button', (e) => console.log('hello', e.ctx.count));
    e.boolean('bool', (e) => true);
    e.select((config) => config.label('hello'));

    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { width: 450, border: -0.1, cropmarks: -0.2, background: 1, label: 'sample-1' },
    });

    const el = e.ctx.el || <Component count={e.ctx.count} />;

    e.render(el);
  });

export default actions;
