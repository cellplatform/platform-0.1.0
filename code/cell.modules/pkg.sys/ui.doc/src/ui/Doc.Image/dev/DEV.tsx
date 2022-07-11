import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { DocImage, DocImageProps } from '..';
import { COLORS, t } from '../common';

const DEFAULT = DocImage.DEFAULT;

export const SAMPLE = {
  sample_1: {
    url: 'https://images.unsplash.com/photo-1511798616182-aab3698ac53e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2176&q=80',
    credit: 'Photo by John Fowler on Unsplash',
  },
  sample_2: {
    url: 'https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2942&q=80',
    credit: 'Photo by Tobias Keller on Unsplash',
  },
  sample_error: {
    url: 'https://error.com/fail.png',
    credit: 'Photo by Foobar',
  },
};

type SampleKey = keyof typeof SAMPLE;

type Ctx = {
  props: DocImageProps;
  debug: {
    sample: SampleKey;
    credit: boolean;
    width: number;
    height?: number;
  };
  ready?: t.DocImageReadyHandlerArgs;
};

const Util = {
  sample(ctx: Ctx) {
    return SAMPLE[ctx.debug.sample];
  },

  toProps(ctx: Ctx) {
    const { debug, props } = ctx;
    const sample = Util.sample(ctx);
    return {
      ...props,
      width: debug.width,
      height: debug.height,
      credit: debug.credit ? sample.credit : undefined,
    };
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Doc.Image')
  .context((e) => {
    if (e.prev) return e.prev;
    const change = e.change;

    const sample: SampleKey = 'sample_1';
    const { url, credit } = SAMPLE[sample];

    const ctx: Ctx = {
      props: {
        url,
        credit,
        borderRadius: DocImage.DEFAULT.borderRadius,
        onReady(e) {
          console.group('⚡️ onReady');
          console.log('e', e);
          console.log('size.rendered', e.size.rendered);
          console.log('size.natural', e.size.natural);
          console.groupEnd();

          change.ctx((ctx) => (ctx.ready = e));
        },
      },
      debug: {
        sample,
        width: 720,
        credit: true,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('width')
        .items(
          [undefined, 300, 720].map((value) => {
            const label = value === undefined ? `<undefined>` : `width: ${value}px`;
            return { label, value };
          }),
        )
        .initial(config.ctx.debug.width)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.width = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .title('height')
        .items(
          [undefined, 200, 360, 400].map((value) => {
            const label = value === undefined ? `<undefined>` : `height: ${value}px`;
            return { label, value };
          }),
        )
        .initial(config.ctx.debug.height)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.debug.height = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.boolean('borderRadius', (e) => {
      if (e.changing) e.ctx.props.borderRadius = e.changing.next ? DEFAULT.borderRadius : 0;
      e.boolean.current = Boolean(e.ctx.props.borderRadius);
    });

    e.boolean('credit', (e) => {
      if (e.changing) e.ctx.debug.credit = e.changing.next;
      e.boolean.current = Boolean(e.ctx.debug.credit);
    });

    e.hr(1, 0.1);

    e.markdown(`url:`);
    Object.keys(SAMPLE).map((key) => {
      const label = `image: ${key.replace(/_/g, '-')}`;
      e.button(label, (e) => (e.ctx.props.url = SAMPLE[key].url));
    });

    e.hr();
  })

  .items((e) => {
    e.title('Dev');

    e.hr();

    e.component((e) => {
      const props = e.ctx.props;

      const MAX = 40;
      let url = props.url;
      if (url && url.length > MAX) url = `${url.substring(0, MAX)}...`;

      const data = { ...props, url };
      return (
        <ObjectView
          name={'props'}
          data={data}
          style={{ MarginX: 15 }}
          fontSize={10}
          expandPaths={['$']}
        />
      );
    });
  })

  .subject((e) => {
    const ready = e.ctx.ready;
    const width = e.ctx.debug.width ?? -1;

    let topLeft = '';
    let topRight = '';
    if (ready) {
      const { rendered, natural } = ready.size;
      topLeft = `rendered size: ${rendered.width}px x ${rendered.height}px`;
      topRight = `natural size: ${natural.width}px x ${natural.height}px`;
    }

    e.settings({
      actions: { width: 380 },
      host: { background: COLORS.BG },
      layout: {
        label: width > 500 ? { topLeft, topRight } : undefined,
        cropmarks: -0.2,
      },
    });
    e.render(<DocImage {...Util.toProps(e.ctx)} />);
  });

export default actions;
