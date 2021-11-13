import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { DevSample, DevSampleProps } from './DEV.Sample';
import { ManifestSelectorStateful } from '../../ManifestSelector';
import { t, rx } from '../../common';

const TARGET_NAME = 'foo';

type Ctx = {
  bus: t.EventBus;
  props: DevSampleProps;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('hook.useModule')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const ctx: Ctx = { bus, props: { bus, target: TARGET_NAME } };
    return ctx;
  })

  .items((e) => {
    e.title('Dev');

    e.component((e) => {
      const bus = e.ctx.bus;
      return (
        <ManifestSelectorStateful
          bus={bus}
          showExports={false}
          style={{ MarginX: 15, marginTop: 10, marginBottom: 20 }}
          onChanged={(event) => {
            e.change.ctx((ctx) => (ctx.props.url = event.url));
          }}
        />
      );
    });

    e.boolean(`target ("${TARGET_NAME}")`, (e) => {
      if (e.changing) e.ctx.props.target = e.changing.next ? TARGET_NAME : undefined;
      e.boolean.current = Boolean(e.ctx.props.target);
    });

    e.hr();
  })

  .subject((e) => {
    const url = e.ctx.props.url;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: { topLeft: 'useModule (hook)' },
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      },
    });
    e.render(<DevSample {...e.ctx.props} />);
  });

export default actions;
