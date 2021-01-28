import React from 'react';
import { Actions, toObject } from '../..';
import { css, COLORS, color } from '../../common';
import { Component } from './Component';

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
  myLayout: SampleLayout;
  isRunning?: boolean;
};

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem.';

let count = 0;

/**
 * Actions
 */
export const actions = Actions<Ctx>()
  .name('ui.dev')
  .context((prev) => prev || { myLayout: 'single', count: 0, text: LOREM, isRunning: true })

  .button('change text', (e) => {
    e.ctx.count++;
    e.ctx.text = e.ctx.text === 'hello' ? LOREM : 'hello';
  })
  .button('inject React', (e) => {
    count++;

    const styles = {
      bgr: css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' }),
      desc: css({
        borderLeft: `solid 8px ${color.format(-0.1)}`,
        paddingLeft: 8,
        PaddingY: 5,
      }),
    };

    const label = <div {...styles.bgr}>Hello ({count})</div>;
    const description = <div {...css(styles.bgr, styles.desc)}>{`${LOREM} (${count})`}</div>;
    e.button.label = label;
    e.settings({ button: { description } });
  })

  .hr()

  .title('Buttons')
  .button((config) => config.label('hello'))
  .hr(1, 0.15, [5, 0])
  .button('console.log', (e) => {
    console.group('🌳 button click');
    console.log('e.ctx', toObject(e.ctx));
    console.log('e.host', toObject(e.host));
    console.groupEnd();
  })
  .button((config) => config.label(`Ellipsis - ${LOREM}`))
  .button((config) => null)
  .button((config) => {
    const markdown = () => {
      let text = '';
      text = `${text} *I am italic*, **I am bold** \`code\` `;
      text = `${text} \n- one\n- two\n - three`;
      text = `${text}\n\n${LOREM}\n\n${LOREM} (${count})`;
      return text.trim();
    };
    config
      .label('markdown')
      .description(markdown())
      .handler((e) => {
        count++;
        console.log('count', count);
        e.button.description = markdown();
      });
  })
  .button('button: change label', (e) => {
    count++;
    e.button.label = `count: ${count}`;
    e.settings({ button: { description: `Lorem ipsum dolar sit (${count})` } });
  })

  .hr(1, 0.15)
  .boolean('boolean (disabled)')
  .boolean('is running', (e) => {
    if (e.changing) {
      count++;
      const isRunning = e.changing.next;
      e.ctx.isRunning = isRunning;
      e.boolean.label = isRunning ? 'running' : 'stopped';
      const description = `the thing is ${e.boolean.label} (${count})`;
      e.settings({ boolean: { description } });
    }

    e.boolean.current = e.ctx.isRunning;
  })

  .hr(1, 0.15)

  .select((config) =>
    config
      .label('select single')
      .items(['one', { label: 'two', value: { count: 2 } }, 3])
      .initial(3)
      .clearable(true)
      .handler((e) => {
        const value = e.select.current[0]; // NB: always first.
        e.select.label = value ? value.label : `select single`;
        e.select.placeholder = !Boolean(value);
      }),
  )

  .select((config) => {
    config
      .label('select (multi)')
      .description('My set of dropdown options')
      .items(['Chocolate', 'Strawberry', 'Vanilla'])
      .multi(true)
      .handler((e) => {
        if (e.changing) count++;
        e.select.description = `My dropdown changed (${count})`;
        const value = e.select.current
          .map((m) => m.label)
          .join(', ')
          .trim();
        e.select.label = value ? value : `select (multi)`;
        e.select.placeholder = !Boolean(value);
      });
  })

  .hr()

  .title('Layouts')
  .button('single: center', (e) => (e.ctx.myLayout = 'single'))
  .button('single: top left', (e) => (e.ctx.myLayout = 'single:top-left'))
  .button('single: bottom right', (e) => (e.ctx.myLayout = 'single:bottom-right'))
  .button('single: fill', (e) => (e.ctx.myLayout = 'single:fill'))
  .button('single: fill (margin)', (e) => (e.ctx.myLayout = 'single:fill-margin'))
  .hr(1, 0.1)
  .button('double: center (y)', (e) => (e.ctx.myLayout = 'double-y'))
  .button('double: center (x)', (e) => (e.ctx.myLayout = 'double-x'))

  .hr()

  .title('Host')
  .button('bg: dark (string)', (e) => {
    e.settings({
      host: { background: COLORS.DARK },
      layout: {
        cropmarks: 0.4,
        labelColor: 0.4,
      },
    });
  })
  .button('bg: light (-0.04)', (e) => (e.host.background = -0.04))
  .button('bg: white (0)', (e) => (e.host.background = 0))
  .button('settings (null)', (e) => e.settings({ host: null }))
  .button('settings: {...}', (e) => e.settings({ host: { background: -0.8 } }))

  .hr()

  .title('Layout (Item)')
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
    const text = `${ctx.count}: ${ctx.text}`;
    const el = <Component text={text} data={data} />;

    if (ctx.myLayout === 'single:top-left') {
      return e.render(el, { position: { top: 50, left: 50 } });
    }

    if (ctx.myLayout === 'single:bottom-right') {
      return e.render(el, { position: { bottom: 50, right: 50 } });
    }

    if (ctx.myLayout === 'single:fill') {
      return e.render(el, { position: 0, cropmarks: false, border: 0 });
    }

    if (ctx.myLayout === 'single:fill-margin') {
      return e.render(el, { position: 80 });
    }

    if (ctx.myLayout === 'double-x') {
      return e
        .settings({ host: { orientation: 'x' } })
        .render(el, { label: 'one', width: 200 })
        .render(el, { label: 'two', width: 300 });
    }

    if (ctx.myLayout === 'double-y') {
      return e
        .settings({ host: { orientation: 'y' } })
        .render(el, { label: { topLeft: 'one' } })
        .render(el, { label: { bottomRight: 'two' } });
    }

    return e.render(el);
  });
