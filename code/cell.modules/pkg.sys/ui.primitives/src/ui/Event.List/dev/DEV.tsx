import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { EventList, EventListProps } from '..';

type Ctx = { props: EventListProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.EventList')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = { props: {} };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
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
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<EventList>',
        position: [150, 80],
        // border: -0.1,
        cropmarks: -0.2,
        // background: 1,
      },
    });

    const el = <Example />;
    e.render(el);

    // e.render(<EventList {...e.ctx.props} />);
  });

export default actions;

/**
 * TEMP
 */

import { VariableSizeList as List } from 'react-window';

// These row heights are arbitrary.
// Yours should be based on the content of the row.
const rowHeights = new Array(1000).fill(true).map(() => 25 + Math.round(Math.random() * 50));

const getItemSize = (index: number) => rowHeights[index];

const Row = ({ index, style }: any) => <div style={style}>Row {index}</div>;

const Example = () => (
  <List height={150} itemCount={1000} itemSize={getItemSize} width={300}>
    {Row}
  </List>
);
