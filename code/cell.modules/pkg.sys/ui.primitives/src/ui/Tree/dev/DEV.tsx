import React from 'react';
import { Subject } from 'rxjs';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { Tree } from '..';
import { css, COLORS, Icons, rx, t } from './common';
import { SAMPLE } from './sample';
import { useSample, useDefaultTreeviewStrategy } from './hooks';

type E = t.TreeviewEvent;
type DebugStateStrategy = 'none' | 'useSample' | 'useDefaultTreeviewStrategy';

type Ctx = {
  bus: t.EventBus<E>;
  initial: t.ITreeviewNode;
  debug: { stateStrategy: DebugStateStrategy };
  props: t.ITreeviewProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Tree')
  .context((e) => {
    if (e.prev) return e.prev;

    const event$ = new Subject<E>();
    const bus = rx.bus<E>(event$);

    const ctx: Ctx = {
      bus,
      initial: SAMPLE.COMPREHENSIVE,
      debug: { stateStrategy: 'useDefaultTreeviewStrategy' },
      props: { theme: 'LIGHT', event$, focusOnLoad: true },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Debug');

    e.select((config) => {
      const items = [
        { label: 'simple', value: SAMPLE.SIMPLE },
        { label: 'comprehensive', value: SAMPLE.COMPREHENSIVE },
        { label: 'twisty', value: SAMPLE.TWISTY },
        { label: 'deep', value: SAMPLE.DEEP },
      ];
      config
        .title('data')
        .items(items)
        .initial(items[1])
        .view('buttons')
        .pipe((e) => {
          const current = e.select.current[0];
          if (e.changing) e.ctx.initial = current.value;
        });
    });

    e.select((config) => {
      const items: DebugStateStrategy[] = ['none', 'useSample', 'useDefaultTreeviewStrategy'];
      config
        .title('state strategy')
        .items(items)
        .initial(config.ctx.debug.stateStrategy)
        .view('buttons')
        .pipe((e) => {
          const value = e.select.current[0]?.value as DebugStateStrategy; // NB: always first.
          if (e.changing) e.ctx.debug.stateStrategy = value;
        });
    });

    e.select((config) => {
      config
        .title('theme')
        .items(['LIGHT', 'DARK'])
        .initial((config.ctx.props.theme as string) ?? 'LIGHT')
        .view('buttons')
        .pipe((e) => {
          const value = e.select.current[0]?.value;
          if (e.changing) e.ctx.props.theme = value;
        });
    });

    e.select((config) => {
      config
        .title('background')
        .items(['NONE', 'THEME'])
        .initial((config.ctx.props.background as string) ?? 'THEME')
        .view('buttons')
        .pipe((e) => {
          const value = e.select.current[0]?.value;
          if (e.changing) e.ctx.props.background = value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.component((e) => {
      // const nav = e.ctx.props.n
      const data = { foo: 123 };
      return <ObjectView data={data} style={css({ Margin: [5, 10] })} fontSize={11} />;
    });
  })

  .subject((e) => {
    const theme = e.ctx.props.theme ?? 'LIGHT';
    const isDark = theme === 'DARK';

    e.settings({
      host: { background: isDark ? COLORS.DARK : -0.04 },
      layout: {
        label: '<TreeView>',
        position: [150, null],
        width: 300,
        border: isDark ? 0.1 : -0.1,
        cropmarks: isDark ? 0.3 : -0.2,
        labelColor: isDark ? COLORS.WHITE : -0.7,
      },
    });

    e.render(<Sample ctx={e.ctx} />);
  });

export default actions;

/**
 * [Helpers]
 */

export type SampleProps = { ctx: Ctx };
export const Sample: React.FC<SampleProps> = (props) => {
  const { ctx } = props;
  const { bus, debug, initial } = ctx;

  const state = debug.stateStrategy;
  const sample = useSample({ bus, initial, isEnabled: state === 'useSample' });
  const defaultStrategy = useDefaultTreeviewStrategy({
    bus,
    initial,
    isEnabled: state === 'useDefaultTreeviewStrategy',
  });

  const root = sample.root ?? defaultStrategy.root;
  const current = sample.current ?? defaultStrategy.current;

  return (
    <Tree.View {...ctx.props} root={root} current={current} renderIcon={renderIcon} tabIndex={0} />
  );
};

const renderIcon: t.RenderTreeIcon = (e) => {
  if (e.icon === 'Face') {
    return Icons[e.icon];
  } else {
    // NB: This arbitrary IF statement is to allow the
    //     event factory "TREEVIEW/render/icon" to be tested.
    return undefined;
  }
};
