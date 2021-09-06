import React from 'react';
import { log, DevActions } from 'sys.ui.dev';
import { StackPanel, StackPanelProps } from '..';
import { Foo } from '@platform/react';
import { css, t, R } from '../../common';

const TestPanel = (props: { label: string }) => (
  <Foo style={{ flex: 1, margin: 5 }}>{props.label}</Foo>
);

const PANELS: t.StackPanel[] = [
  { el: <TestPanel label={'one'} />, offsetOpacity: 0 },
  { el: <TestPanel label={'two'} />, offsetOpacity: 0 },
  { el: <TestPanel label={'three'} />, offsetOpacity: 0 },
];

type Ctx = { props: StackPanelProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.StackPanel')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: { index: 0, panels: PANELS },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.button('panels: (3)', (e) => {
      const props = e.ctx.props;
      props.panels = PANELS;
      props.index = 0;
    });

    e.button('panels: <undefined>', (e) => {
      const props = e.ctx.props;
      props.panels = undefined;
    });

    e.hr();
  })

  .items((e) => {
    e.title('index');

    e.button('up (+)', (e) => {
      const props = e.ctx.props;
      const current = props.index ?? -1;
      props.index = R.clamp(0, PANELS.length - 1, current + 1);
    });
    e.button('down (-1)', (e) => {
      const props = e.ctx.props;
      const current = props.index ?? -1;
      props.index = R.clamp(0, PANELS.length - 1, current - 1);
    });
    e.hr(1, 0.1);

    e.button('first', (e) => (e.ctx.props.index = 0));
    e.button('last', (e) => (e.ctx.props.index = PANELS.length - 1));

    e.hr();
  })

  .subject((e) => {
    const props = e.ctx.props;
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<StackPanel>',
          topRight: `index: ${props.index ?? -1}`,
        },
        position: [80, null],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });

    const styles = {
      panel: css({ width: 350, display: 'flex', boxSizing: 'border-box' }),
    };

    const el = (
      <StackPanel
        {...props}
        style={styles.panel}
        onSlide={(e) => {
          log.info('onSlide', e);
        }}
      />
    );

    e.render(el);
  });

export default actions;
