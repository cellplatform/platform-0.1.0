import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { CardStack, CardStackProps, CardStackItem, CardStackItemRender } from '..';
import { slug } from './common';
import { SampleCard } from './DEV.Sample.Card';

type Ctx = { props: CardStackProps };

const createItems = (length: number) => Array.from({ length }).map(() => createItem());
const createItem = (): CardStackItem => {
  const id = slug();
  const el: CardStackItemRender = (e) => <SampleCard id={id} isTop={e.is.top} />;
  return { id, el };
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/CardStack')
  .context((e) => {
    if (e.prev) return e.prev;

    return {
      props: {
        items: createItems(3),
        maxDepth: 5,
        duration: 300,
      },
    };
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .title('maxDepth')
        .view('buttons')
        .items([0, 2, 3, 5, 10])
        .initial(config.ctx.props.maxDepth)
        .pipe((e) => {
          if (e.changing) e.ctx.props.maxDepth = e.changing.next[0].value;
        });
    });

    e.select((config) => {
      config
        .title('duration (msecs)')
        .view('buttons')
        .items([0, 150, { label: '300 (default)', value: 300 }, 500, 1000])
        .initial(config.ctx.props.duration)
        .pipe((e) => {
          if (e.changing) e.ctx.props.duration = e.changing.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Items');
    e.button('reset (1)', (e) => (e.ctx.props.items = createItems(1)));
    e.button('reset (3)', (e) => (e.ctx.props.items = createItems(3)));
    e.button('none (undefined)', (e) => (e.ctx.props.items = undefined));

    e.hr(1, 0.1);

    e.button('push', (e) => {
      const props = e.ctx.props;
      const items = props.items || (props.items = []);
      items.push(createItem());
    });

    e.hr();
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });

    e.render(<CardStack {...e.ctx.props} />);
  });

export default actions;
