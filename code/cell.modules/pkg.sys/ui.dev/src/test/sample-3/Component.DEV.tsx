import React from 'react';
import { DevActions, ActionsFactory, toObject } from '../..';
import { Component } from './Component';
import { t } from '../../common';
import { Button } from '../../api/Actions.Item';
import { DevDefs, DisplayDefs } from '../../defs';

type O = Record<string, unknown>;

type Ctx = {
  count: number;
};

type M = t.DevMethods<Ctx> & t.DisplayMethods<Ctx>;

const ComposedActions = <Ctx extends O>() =>
  ActionsFactory.compose<Ctx, M>([...DevDefs, ...DisplayDefs]);

/**
 * Actions
 */
export const actions = ComposedActions<Ctx>()
  .namespace('sample-3')
  .context((prev) => prev || { count: 0 })

  .button('increment', (e) => e.ctx.count++)
  .hr()

  .items((e) => {
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
    e.render(<Component count={e.ctx.count} />);
  });
