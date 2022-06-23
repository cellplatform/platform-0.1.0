import React from 'react';
import { Subject } from 'rxjs';
import { DevActions, ObjectView } from 'sys.ui.dev';

import { Tree } from '..';
import { css, COLORS, Icons, rx, t } from './common';
import { SAMPLE } from './dev.sample';
import { useTreeEventsSample, useTreeviewStrategyDefaultSample } from './dev.hooks';

type E = t.TreeviewEvent;
type DebugStateStrategy =
  | 'none'
  | 'useEventsSample'
  | 'useDefaultTreeviewStrategy'
  | 'useTreeTranslator';

type Ctx = {
  bus: t.EventBus<E>;
  props: t.ITreeviewProps;
  debug: { columns: number; stateStrategy: DebugStateStrategy; initial: t.ITreeviewNode };
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
      props: { event$, theme: 'LIGHT', background: 'NONE' },
      debug: {
        columns: 1,
        // stateStrategy: 'useDefaultTreeviewStrategy',
        // stateStrategy: 'useTreeTranslator',
        stateStrategy: 'useEventsSample',
        initial: SAMPLE.COMPREHENSIVE,
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('Debug');
    e.hr();

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
          if (e.changing) e.ctx.debug.initial = current.value;
        });
    });

    e.select((config) => {
      const items: DebugStateStrategy[] = [
        'none',
        'useEventsSample',
        'useDefaultTreeviewStrategy',
        'useTreeTranslator',
      ];
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
        .title('columns')
        .items([1, 2, 3, 4].map((num) => num.toString()))
        .initial(config.ctx.debug.columns.toString())
        .view('buttons')
        .pipe((e) => {
          const value = e.select.current[0]?.value;
          if (e.changing) e.ctx.debug.columns = parseInt(value, 10);
        });
    });

    e.hr(1, 0.1);

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

  .subject((e) => {
    const debug = e.ctx.debug;

    const columns = debug.columns;
    const isMultiColumn = columns > 1;

    const theme = e.ctx.props.theme ?? 'LIGHT';
    const isDark = theme === 'DARK';

    e.settings({
      host: { background: isDark ? COLORS.DARK : 0.8 },
      layout: {
        label: '<TreeView>',
        position: [150, isMultiColumn ? 120 : null],
        width: isMultiColumn ? undefined : 300,
        border: isDark ? 0.1 : -0.1,
        cropmarks: isDark ? 0.3 : -0.2,
        labelColor: isDark ? COLORS.WHITE : -0.7,
        background: isDark ? undefined : 1,
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
  const { bus, debug } = ctx;

  const { columns, initial } = debug;
  const state = debug.stateStrategy;

  const sample = useTreeEventsSample({
    bus,
    initial,
    columns,
    isEnabled: state === 'useEventsSample',
  });
  const defaultStrategy = useTreeviewStrategyDefaultSample({
    bus,
    initial,
    isEnabled: state === 'useDefaultTreeviewStrategy',
  });
  const translator = Tree.Hooks.useTreeTranslator({
    bus,
    isEnabled: state === 'useTreeTranslator',
  });

  const root = sample.root ?? defaultStrategy.root ?? translator.root;
  const current = sample.current ?? defaultStrategy.current ?? translator.current;

  /**
   * Single column
   */
  if (columns === 1) {
    return (
      <Tree.View
        {...ctx.props}
        root={root}
        current={current}
        renderIcon={renderIcon}
        tabIndex={0}
        focusOnLoad={true}
      />
    );
  }

  /**
   * Multi column.
   */
  if (columns > 1) {
    return (
      <Tree.Columns
        {...ctx.props}
        total={columns}
        root={root}
        current={current}
        renderIcon={renderIcon}
        background={'NONE'}
        tabIndex={0}
        focusOnLoad={true}
      />
    );
  }

  return null;
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
