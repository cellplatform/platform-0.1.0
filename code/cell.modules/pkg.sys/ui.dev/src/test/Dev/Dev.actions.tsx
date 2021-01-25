import React from 'react';
import { Actions, toObject } from '../..';
import { css } from '../../common';

type SampleLayout =
  | 'single'
  | 'single:top-left'
  | 'single:bottom-right'
  | 'single:fill'
  | 'single:fill-margin'
  | 'double-x'
  | 'double-y';

type Ctx = {
  count: number;
  text: string;
  layout: SampleLayout;
  isRunning?: boolean;
};

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor.';

/**
 * Actions
 */
export const actions = Actions<Ctx>()
  .context((prev) => prev || { layout: 'single', count: 0, text: LOREM, isRunning: true })

  .button('change text', (ctx) => {
    ctx.count++;
    ctx.text = ctx.text === 'hello' ? LOREM : 'hello';
  })

  .hr()

  .title('Buttons')
  .button((config) => config.label('hello'))
  .hr(1, 0.14, [5, 0])
  .button('console.log', (ctx, env) => {
    console.group('🌳 button click');
    console.log('ctx', toObject(ctx));
    console.log('env', toObject(env));
    console.groupEnd();
  })
  .button((e) => e.label(`Ellipsis - ${LOREM}`))
  .button((e) => e.description(LOREM))
  .hr(1, 0.15)
  .boolean('boolean (disabled)')
  .boolean('is running', (e) => {
    console.log('boolean is running');
    if (e.change) e.ctx.isRunning = !Boolean(e.ctx.isRunning);
    return Boolean(e.ctx.isRunning);
  })

  .hr()

  .title('Layouts')
  .button('single: center', (ctx) => (ctx.layout = 'single'))
  .button('single: top left', (ctx) => (ctx.layout = 'single:top-left'))
  .button('single: bottom right', (ctx) => (ctx.layout = 'single:bottom-right'))
  .button('single: fill', (ctx) => (ctx.layout = 'single:fill'))
  .button('single: fill (margin)', (ctx) => (ctx.layout = 'single:fill-margin'))
  .hr(1, 0.1)
  .button('double: center (y)', (ctx) => (ctx.layout = 'double-y'))
  .button('double: center (x)', (ctx) => (ctx.layout = 'double-x'))

  .hr()

  .title('Env')
  .button('bg: dark', (ctx, env) => {
    console.log('env', toObject(env));
  })

  .hr()

  /**
   * Subject component renderer.
   */
  .subject((e) => {
    const { ctx } = e;
    const style = css({ padding: 20 });

    console.log('render subject');

    // NB: common layout (variations merged in in render arg below)
    e.layout({
      width: 450,
      border: -0.1,
      cropmarks: -0.2,
      background: 1,
      label: 'foobar',
    });

    const el = (
      <div {...style}>
        {ctx.count}: {e.ctx.text} (is running: {Boolean(ctx.isRunning).toString()})
      </div>
    );

    if (ctx.layout === 'single:top-left') {
      return e.render(el, { position: { top: 50, left: 50 } });
    }

    if (ctx.layout === 'single:bottom-right') {
      return e.render(el, { position: { bottom: 50, right: 50 } });
    }

    if (ctx.layout === 'single:fill') {
      return e.render(el, { position: 0, cropmarks: false, border: 0 });
    }

    if (ctx.layout === 'single:fill-margin') {
      return e.render(el, { position: 80 });
    }

    if (ctx.layout === 'double-x') {
      return e
        .orientation('x', 50)
        .render(el, { label: 'one', width: 200 })
        .render(el, { label: 'two', width: 300 });
    }

    if (ctx.layout === 'double-y') {
      return e
        .orientation('y')
        .render(el, { label: { topLeft: 'one' } })
        .render(el, { label: { bottomRight: 'two' } });
    }

    return e.render(el);
  });
