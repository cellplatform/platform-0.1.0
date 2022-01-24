import React from 'react';
import { DevActions } from '../..';
import { css, COLORS, color, time, lorem } from '../../common';
import { Component } from './Component';
import { Button } from '../../web.ui/Primitives';

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
  throw?: boolean;
};

const LOREM = lorem.words(12, '.');

const markdown = () => {
  let text = '';
  text = `I am markdown. ${text} *I am italic*, **I am bold**,  `;
  text = `${text} \nI am \`code\``;
  text = `${text} \n- one\n- two\n - three`;
  text = `${text}\n\n${LOREM}\n\n${LOREM} (${count})`;
  return text.trim();
};

let count = 0;

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('test/sample-1')
  .context((e) => {
    if (e.prev) return e.prev;
    return { myLayout: 'single', count: 0, text: LOREM, isRunning: true };
  })

  .items((e) => {
    e.title('Component');

    e.button('increment', (e) => e.ctx.count++);

    type SampleProps = {
      text: string;
      count: number;
      onIncrement?: () => void;
      onEnvironment?: () => void;
    };
    const Sample: React.FC<SampleProps> = (props) => {
      const styles = {
        base: css({
          margin: 1,
          padding: 12,
          backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          fontSize: 12,
        }),
        count: css({
          Absolute: [3, 5, null, null],
          fontSize: 10,
          opacity: 0.5,
        }),
        buttons: css({
          Flex: 'horizontal-spaceBetween-center',
        }),
      };
      return (
        <div {...css(styles.base)}>
          <div>{props.text}</div>
          <div {...styles.count}>count: {props.count}</div>
          <div {...styles.buttons}>
            <Button onClick={props.onIncrement}>Increment</Button>
            <Button onClick={props.onEnvironment}>Environment</Button>
          </div>
        </div>
      );
    };

    e.component((e) => {
      return (
        <Sample
          text={'Foo'}
          count={e.ctx.count}
          onIncrement={() => e.change.ctx((draft) => draft.count++)}
          onEnvironment={() => e.change.settings({ host: { background: COLORS.DARK } })}
        />
      );
    });

    e.component((e) => {
      return (
        <Sample
          text={'Bar'}
          count={e.ctx.count}
          onIncrement={() => e.change.ctx((draft) => draft.count++)}
          onEnvironment={() => e.change.settings({ host: { background: -0.03 } })}
        />
      );
    });

    e.hr();
  })

  .items((e) => {
    e.title('Title [TODO]');
    e.title((config) => config.text('Title (Indented)').indent(25));
    e.markdown(markdown());

    e.title('Context');
    e.button('change text [TODO] foobar', (e) => {
      e.ctx.count++;
      e.ctx.text = e.ctx.text === 'hello' ? LOREM : 'hello';
    });

    e.button('inject <React>', (btn) => {
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
      btn.button.label = label;
      btn.settings({ button: { description } });
    });

    e.boolean('error', (e) => {
      if (e.changing) e.ctx.throw = e.changing.next;
      e.boolean.current = e.ctx.throw;
    });

    e.markdown((config) => {
      config.text(markdown()).margin([40, 35, 20, 20]);
    });

    e.markdown((config) => {
      config.text('Markdown indented by `35` pixels').indent(35);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Button');
    e.button((config) => config.label('disabled (no handler)'));
    e.button('delay', async (e) => await time.delay(1200));
    e.hr(1, 0.15, [5, 0]);

    e.button('console.log', (e) => {
      console.group('🌳 button click');
      console.log('e.ctx', e.toObject(e.ctx));
      console.log('e.host', e.toObject(e.host));
      console.groupEnd();
    });
    e.button((config) => config.label(`Indented Ellipsis - ${LOREM}`).indent(25));
    e.button((config) => null);
    e.button((config) => {
      config
        .title('My button title:')
        .label('markdown')
        .description(markdown())
        .pipe((e) => {
          count++;
          e.button.description = markdown();
        });
    });
    e.button('button: change label', (e) => {
      count++;
      e.button.label = `count: ${count}`;
      e.settings({ button: { description: `Lorem ipsum dolar sit (${count})` } });
    });
    e.button((config) => {
      config.label('multiple handlers').pipe(
        (e) => count++,
        (e) => (e.button.label = `multi: ${count}`),
      );
    });

    e.hr();
  })

  .items((e) => {
    e.title('Hr');
    e.hr(1, 0.15);
    e.hr(3, 0.15, [2, 50]);
    e.hr((config) => config.height(1).opacity(0.15).margin([15, 0]).indent(25));
    e.hr(1, 0.15, [15, 0], 'dashed');
    e.hr();
  })

  .items((e) => {
    e.title('Textbox');

    e.textbox('my textbox `code`', (e) => {
      // console.log('e', e);
    });

    e.textbox((config) =>
      config
        .placeholder('hello')
        .initial('initial value')
        .description('My textbox description.')
        .pipe((e) => {
          if (e.changing?.action === 'invoke') {
            count++;
            e.textbox.description = `Textbox description (invoked ${count})`;
            e.textbox.placeholder = `Placeholder (invoked ${count})`;
            const next = e.changing.next || '';
            e.textbox.current = `${(next[0] || '').toUpperCase()}${next.substring(1)}`;
          }
        }),
    );

    e.textbox((config) => {
      config.indent(45).title('indented textbox');
    });

    e.hr();
  })

  .items((e) => {
    e.title('Select');
    e.select((config) =>
      config
        .title('My dropdown title:')
        .label('select single')
        .items(['one', { label: 'two', value: { count: 2 } }, 3])
        .initial(3)
        .clearable(true)
        .pipe(async (e) => {
          const current = e.select.current[0]; // NB: always first.
          e.select.label = current ? current.label : `select single`;
          e.select.isPlaceholder = !Boolean(current);
          if (e.changing) await time.wait(400);
        }),
    );

    e.select((config) => {
      config
        .label('select (multi)')
        .description('My set of dropdown options')
        .items(['Chocolate', 'Strawberry', 'Vanilla'])
        .multi(true)
        .indent(25)
        .pipe((e) => {
          if (e.changing) count++;
          e.select.description = `My dropdown changed (${count})`;
          const current = e.select.current
            .map((m) => m.label)
            .join(', ')
            .trim();

          e.settings({
            select: {
              label: current ? current : `select (multi)`,
              isPlaceholder: !Boolean(current),
            },
          });
        });
    });

    e.select((config) => {
      config
        .title('My radio options')
        .initial('Chocolate')
        .description('My set mutually exclusive options')
        .view('buttons')
        .items(['Chocolate', 'Strawberry', 'Vanilla'])
        // .clearable(true)
        .pipe((e) => {
          //
        });
    });

    e.select((config) => {
      config
        .title('My checkbox options')
        .label('checkbox')
        .multi(true) // NB: This is what turns the buttons into [x] checkboxes.
        .view('buttons')
        .items(['Chocolate', 'Strawberry', 'Vanilla', 'Bananna'])
        .initial(['Strawberry', 'Vanilla'])
        .clearable(true)
        .indent(25)
        .pipe((e) => {
          if (e.changing) count++;
          e.select.description = `My dropdown changed (${count})`;

          const current = e.select.current
            .map((m) => m.label)
            .join(', ')
            .trim();

          e.settings({
            select: {
              label: current ? current : `select (multi)`,
              isPlaceholder: !Boolean(current),
            },
          });
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Boolean');

    e.boolean('boolean (disabled)');

    e.boolean((config) =>
      config
        .title('My switch title:')
        .label('spinner')
        .pipe(async (e) => {
          if (e.changing) await time.wait(800);
        }),
    );

    // e.boolean('spinner', async (e) => {});

    e.boolean('is running', (e) => {
      if (e.changing) {
        count++;
        const isRunning = e.changing.next;
        e.ctx.isRunning = isRunning;
        e.boolean.label = isRunning ? 'running' : 'stopped';
        e.boolean.description = `the thing is ${e.boolean.label} (${count})`;
      }

      e.boolean.current = e.ctx.isRunning;
    });

    e.boolean((config) =>
      config
        .label('indented')
        .indent(50)
        .pipe(async (e) => {
          if (e.changing) await time.wait(800);
        }),
    );

    e.hr();
  })

  .items((e) => {
    e.title('Layouts');
    e.button('single: center', (e) => (e.ctx.myLayout = 'single'));
    e.button('single: top left', (e) => (e.ctx.myLayout = 'single:top-left'));
    e.button('single: bottom right', (e) => (e.ctx.myLayout = 'single:bottom-right'));
    e.button('single: fill', (e) => (e.ctx.myLayout = 'single:fill'));
    e.button('single: fill (margin)', (e) => (e.ctx.myLayout = 'single:fill-margin'));
    e.hr(1, 0.1);
    e.button('double: center (y)', (e) => (e.ctx.myLayout = 'double-y'));
    e.button('double: center (x)', (e) => (e.ctx.myLayout = 'double-x'));

    e.hr();
  })

  .items((e) => {
    e.title('Style: host');
    e.button('bg: dark (string)', (e) => {
      e.settings({
        host: { background: COLORS.DARK },
        layout: { cropmarks: 0.4, labelColor: 0.4 },
      });
    });
    e.button('bg: white (0)', (e) => (e.host.background = 0));
    e.button('bg: light (-0.04)', (e) => (e.host.background = -0.04));
    e.button('settings (null)', (e) => e.settings({ host: null }));
    e.button('settings: {...}', (e) => e.settings({ host: { background: -0.8 } }));
    e.button('position: [array-2]', (e) => {
      e.settings({ layout: { position: [null, 80], height: 300 } });
    });
    e.button('position: [array-4]', (e) => {
      e.layout.position = [null, 80, 150, 80];
      e.layout.height = 300;
    });
    e.button('position: [null, 80]', (e) => (e.layout.position = [null, 80]));

    e.hr();
  })

  .items((e) => {
    e.title('Style: actions');
    e.button('bg: white (0)', (e) => (e.actions.background = 0));
    e.button('bg: light (-0.04)', (e) => (e.actions.background = -0.04));
    e.button('bg: dark (-0.1)', (e) => (e.actions.background = -0.1));
    e.button('edge: left', (e) => (e.actions.edge = 'left'));
    e.button('edge: right', (e) => (e.actions.edge = 'right'));
    e.button('border: default', (e) => (e.actions.border = undefined));
    e.button('border: thick', (e) => (e.actions.border = [-0.1, 5]));
    e.button('width: 300 (default)', (e) => (e.actions.width = undefined));
    e.button('width: 500', (e) => (e.actions.width = 500));

    e.hr();
  })

  .items((e) => {
    e.title('Style: item layout');
    e.button('background: 1', (e) => (e.layout.background = 1));
    e.button('background: -0.3', (e) => (e.layout.background = -0.3));
    e.button('cropmarks: 0.7', (e) => (e.layout.cropmarks = 0.7));
    e.button('settings (null)', (e) => e.settings({ layout: null }));
    e.button('settings: {...}', (e) =>
      e.settings({ layout: { background: -0.1, cropmarks: -0.6 } }),
    );

    e.hr();
  })

  /**
   * Subject component renderer.
   */
  .subject((e) => {
    const { ctx } = e;

    // NB: common layout (variations merged into the render arg below)
    e.settings({
      layout: {
        width: 450,
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        label: 'sample-1',
      },
      host: { background: -0.03 },
    });

    const data = { isRunning: ctx.isRunning };
    const text = `${ctx.count}: ${ctx.text}`;
    const el = <Component text={text} data={data} />;

    if (ctx.throw) {
      throw new Error('My Error');
    }

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
      return e.render(el, { position: [150, 80] });
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

export default actions;
