import React, { useEffect, useRef, useState } from 'react';

import { Actions } from '../..';
import { StateObject, t, css } from '../../common';

type M = {
  text?: string;
  layout:
    | 'single'
    | 'single:top-left'
    | 'single:bottom-right'
    | 'single:fill'
    | 'single:fill-margin'
    | 'double-x'
    | 'double-y';
};
type Ctx = {
  model: t.IStateObjectWritable<M>;
  change: t.IStateObjectWritable<M>['change'];
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor.';

const model = StateObject.create<M>({ text: LOREM, layout: 'single' });

const change = (model: Ctx['model']) => {
  model.change((draft) => (draft.text = draft.text === 'hello' ? LOREM : 'hello'));
};

/**
 * Actions
 */
export const actions = Actions<Ctx>()
  .context((prev) => prev || { model, change: model.change })
  .subject((e) => {
    const state = e.ctx.model.state;
    const style = css({ padding: 20 });

    // NB: common layout (variations merged in in render arg below)
    e.layout({
      width: 450,
      border: -0.1,
      cropmarks: -0.2,
      background: 1,
    });

    const el = <div {...style}>{state.text}</div>;

    if (state.layout === 'single:top-left') {
      return e.render(el, { position: { top: 50, left: 50 } });
    }

    if (state.layout === 'single:bottom-right') {
      return e.render(el, { position: { bottom: 50, right: 50 } });
    }

    if (state.layout === 'single:fill') {
      return e.render(el, { position: 0, cropmarks: false, border: 0 });
    }

    if (state.layout === 'single:fill-margin') {
      return e.render(el, { position: 80 });
    }

    if (state.layout === 'double-x') {
      return e.orientation('x').render(el).render(el);
    }

    if (state.layout === 'double-y') {
      return e.orientation('y').render(el).render(el);
    }

    return e.render(el);
  })

  .button('foo', (ctx) => change(ctx.model))
  .button((e) => e.label(LOREM))
  .button((e) => e.description(LOREM))

  .hr()
  .title('Group 1')

  .button('change text', (ctx) => change(ctx.model))
  .hr(0)
  .button((config) => config.label('hello'))
  .hr(1, 0.14, [5, 0])
  .button('console.log', (ctx) => console.log('hello', ctx))

  // .hr()
  // .title('Position')
  // .button('top left', (ctx) => ctx.change((draft) => (draft.position = { top: 50, left: 50 })))
  // .button('clear (center)', (ctx) => ctx.change((draft) => (draft.position = undefined)))

  .hr()
  .title('color')
  .button('red', () => null)
  .button('green', () => null)
  .button('blue', () => null)

  .hr()
  .title('layouts')
  .button('single: center', (ctx) => ctx.change((d) => (d.layout = 'single')))
  .button('single: top left', (ctx) => ctx.change((d) => (d.layout = 'single:top-left')))
  .button('single: bottom right', (ctx) => ctx.change((d) => (d.layout = 'single:bottom-right')))
  .button('single: fill', (ctx) => ctx.change((d) => (d.layout = 'single:fill')))
  .button('single: fill (margin)', (ctx) => ctx.change((d) => (d.layout = 'single:fill-margin')))
  .hr(1)
  .button('double: center (y)', (ctx) => ctx.change((d) => (d.layout = 'double-y')))
  .button('double: center (x)', (ctx) => ctx.change((d) => (d.layout = 'double-x')))
  .hr(1)

  .hr();
