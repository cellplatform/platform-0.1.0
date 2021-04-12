import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { CardStack, CardStackProps, CardStackItem } from '..';
import { slug } from './common';
import { SampleCard } from './DEV.Sample.Card';

type Ctx = { props: CardStackProps };

const createItems = (length: number) => Array.from({ length }).map(() => createItem());
const createItem = () => {
  const id = slug();
  const el = <SampleCard id={id} />;
  const item: CardStackItem = { id, el };
  return item;
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/CardStack')
  .context((prev) => {
    if (prev) return prev;

    return {
      props: { items: createItems(3), maxDepth: 5 },
    };
  })

  .items((e) => {
    e.title('Props');

    e.select((config) => {
      config
        .initial(config.ctx.props.maxDepth)
        .title('maxDepth')
        .view('buttons')
        .items([0, 2, 3, 5, 10])
        .pipe((e) => {
          if (e.changing) {
            console.log('e.changing', e.changing);
            const f = e.changing.next[0].value;
            console.log('f', f);
            e.ctx.props.maxDepth = e.changing.next[0].value;
          }
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Items');
    e.button('reset (3)', (e) => (e.ctx.props.items = createItems(3)));
    e.button('none (undefined)', (e) => (e.ctx.props.items = undefined));

    e.button('push', (e) => {
      const props = e.ctx.props;
      const items = props.items || (props.items = []);
      items.push(createItem());
      // const max = 5;
      // if (items.length > max) {
      //   props.items = items.slice(items.length - max);
      // }
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
