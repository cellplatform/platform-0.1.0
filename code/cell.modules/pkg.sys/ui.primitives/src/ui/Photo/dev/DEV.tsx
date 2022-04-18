import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Photo, PhotoProps } from '..';
import { t } from '../common';

type Ctx = {
  props: PhotoProps;
  debug: {
    //
  };
};

const PHOTO: t.Photo = {
  // url: 'https://source.unsplash.com/ntqaFfrDdEA/1920x1280', // Sample
  url: 'http://localhost:5000/Pre-Memorial%20(via%20Email)/070422%20Paul%20&%20Gay%2008.jpeg',
};

const DEFAULT = {
  PHOTO,
};

const Util = {
  toProps(ctx: Ctx) {
    const props = { ...ctx.props };
    return props;
  },

  toDefs(ctx: Ctx) {
    return [...Photo.toDefs(ctx.props.def)];
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Photo')
  .context((e) => {
    if (e.prev) return e.prev;

    const ctx: Ctx = {
      props: { def: DEFAULT.PHOTO },
      debug: {},
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Def (Items)');

    e.button('add photo', (e) => {
      const defs = Photo.toDefs(e.ctx.props.def);

      if (defs.length === 0) {
        e.ctx.props.def = DEFAULT.PHOTO; // NB: As singular value.
      } else {
        defs.push(DEFAULT.PHOTO);
        e.ctx.props.def = defs; // NB: As [list].
      }
    });

    e.hr(1, 0.1);

    e.button('remove (first)', (e) => {
      const defs = Photo.toDefs(e.ctx.props.def);
      e.ctx.props.def = defs.slice(1);
    });

    e.button('remove (last)', (e) => {
      const defs = Photo.toDefs(e.ctx.props.def);
      e.ctx.props.def = defs.slice(0, defs.length - 1);
    });

    e.hr(1, 0.1);

    e.button('clear', (e) => {
      e.ctx.props.def = undefined;
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.hr();

    e.component((e) => {
      const props = Util.toProps(e.ctx);
      return (
        <ObjectView
          name={'props'}
          data={props}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const props = Util.toProps(e.ctx);

    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Photo>',
        position: [150, 80],
        border: -0.1,
        cropmarks: -0.2,
      },
    });

    e.render(<Photo {...props} style={{ flex: 1 }} />);
  });

export default actions;
