import React from 'react';
import { DevActions, ObjectView, rx, slug, t } from '../../../test';
import { FsCard, FsCardProps } from '..';

type Ctx = {
  props: FsCardProps;
  debug: { render: boolean };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Filesystem.Card')
  .context((e) => {
    if (e.prev) return e.prev;

    const bus = rx.bus();
    const instance: t.FsCardInstance = { bus, id: `foo.${slug()}` };

    const ctx: Ctx = {
      props: {
        instance,
        showAsCard: true,
      },
      debug: { render: true },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.boolean('render', (e) => {
      if (e.changing) e.ctx.debug.render = e.changing.next;
      e.boolean.current = e.ctx.debug.render;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Props');

    e.boolean('showAsCard', (e) => {
      if (e.changing) e.ctx.props.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.props.showAsCard;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.hr();

    e.component((e) => {
      return (
        <ObjectView
          name={'props'}
          data={e.ctx.props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const { props, debug } = e.ctx;
    const instance = props.instance;

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: {
          topLeft: '<Filesystem.Card>',
          bottomLeft: `${rx.bus.instance(instance.bus)}`,
        },
        width: 550,
        height: 400,
        cropmarks: -0.2,
      },
    });

    e.render(debug.render && <FsCard {...props} style={{ flex: 1 }} />);
  });

export default actions;
