import React from 'react';

import { ActionsFactory } from '../..';
import { t, time } from '../../common';
import { DevDefs, DisplayDefs } from '../../defs';
import { Component } from './Component';

type O = Record<string, unknown>;

type Ctx = {
  count: number;
  el?: JSX.Element;
  increment(): void;
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
      count: 0,
      increment() {
        e.change.ctx((ctx) => ctx.count++);
      },
    };

    return ctx;
  })

  .items((e) => {
    e.title('increment');
    e.button('count++', (e) => e.ctx.count++);
    e.button('ctx.increment()', (e) => e.ctx.increment());
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
    console.log('SUBJECT');

    e.settings({
      host: { background: -0.04 },
      layout: { width: 450, border: -0.1, cropmarks: -0.2, background: 1, label: 'sample-1' },
    });

    const el = e.ctx.el || <Component count={e.ctx.count} />;

    e.render(el);
  });

export default actions;
