import React from 'react';
import { Actions, toObject } from '../..';
import { css, COLORS } from '../../common';
import { ObjectView } from '@platform/ui.object';

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
  .name('ui.dev')
  .context((prev) => prev || { layout: 'single', count: 0, text: LOREM, isRunning: true })

  .button('change text', (e) => {
    e.ctx.count++;
    e.ctx.text = e.ctx.text === 'hello' ? LOREM : 'hello';
  })

  .hr()

  .title('Buttons')
  .button((config) => config.label('hello'))
  .hr(1, 0.14, [5, 0])
  .button('console.log', (e) => {
    console.group('🌳 button click');
    console.log('e.ctx', toObject(e.ctx));
    console.log('e.host', toObject(e.host));
    console.groupEnd();
  })
  .button((e) => e.label(`Ellipsis - ${LOREM}`))
  .button((e) => e.description(LOREM))
  .hr(1, 0.15)
  .boolean('boolean (disabled)')
  .boolean('is running', (e) => {
    if (e.change) e.ctx.isRunning = !Boolean(e.ctx.isRunning);
    return Boolean(e.ctx.isRunning);
  })

  .hr()

  .title('Layouts')
  .button('single: center', (e) => (e.ctx.layout = 'single'))
  .button('single: top left', (e) => (e.ctx.layout = 'single:top-left'))
  .button('single: bottom right', (e) => (e.ctx.layout = 'single:bottom-right'))
  .button('single: fill', (e) => (e.ctx.layout = 'single:fill'))
  .button('single: fill (margin)', (e) => (e.ctx.layout = 'single:fill-margin'))
  .hr(1, 0.1)
  .button('double: center (y)', (e) => (e.ctx.layout = 'double-y'))
  .button('double: center (x)', (e) => (e.ctx.layout = 'double-x'))

  .hr()

  .title('Host')
  .button('bg: dark (string)', (e) => (e.host.background = COLORS.DARK))
  .button('bg: light (-0.04)', (e) => (e.host.background = -0.04))
  .button('bg: white (0)', (e) => (e.host.background = 0))
  .button('settings (null)', (e) => e.settings({ host: null }))
  .button('settings: {...}', (e) => e.settings({ host: { background: -0.8 } }))

  .hr()

  .title('Layout')
  .button('background: 1', (e) => (e.layout.background = 1))
  .button('background: -0.3', (e) => (e.layout.background = -0.3))
  .button('cropmarks: 0.7', (e) => (e.layout.cropmarks = 0.7))
  .button('settings (null)', (e) => e.settings({ layout: null }))
  .button('settings: {...}', (e) => e.settings({ layout: { background: -0.1, cropmarks: -0.6 } }))

  .hr()

  /**
   * Subject component renderer.
   */
  .subject((e) => {
    const { ctx } = e;

    // NB: common layout (variations merged in in render arg below)
    e.settings({
      layout: {
        width: 450,
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: 'foobar',
      },
      host: {
        background: -0.04,
      },
    });

    const data = { isRunning: ctx.isRunning };

    const styles = {
      base: css({ padding: 20 }),
      text: css({ marginBottom: 10 }),
    };

    const el = (
      <div {...styles.base}>
        <div {...styles.text}>
          {ctx.count}: {e.ctx.text}
        </div>
        <ObjectView name={'subject'} data={data} />
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

    /**
     * TODO 🐷
     */

    if (ctx.layout === 'double-x') {
      return e
        .settings({ host: { orientation: 'x' } })
        .render(el, { label: 'one', width: 200 })
        .render(el, { label: 'two', width: 300 });
    }

    if (ctx.layout === 'double-y') {
      return e
        .settings({ host: { orientation: 'y' } })
        .render(el, { label: { topLeft: 'one' } })
        .render(el, { label: { bottomRight: 'two' } });
    }

    return e.render(el);
  });
