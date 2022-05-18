import React from 'react';
import { DevActions, ObjectView } from 'sys.ui.dev';
import { Chip, ChipProps } from '..';
import { Icons, Button } from '../common';

type Ctx = { props: ChipProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Chip')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        inline: true,
        tooltip: 'My Tooltip',
        body: ['One', 'Two'],
      },
    };
    return ctx;
  })

  .init(async (e) => {
    const { ctx, bus } = e;
  })

  .items((e) => {
    e.title('Props');

    e.boolean('inline', (e) => {
      if (e.changing) e.ctx.props.inline = e.changing.next;
      e.boolean.current = e.ctx.props.inline;
    });

    e.boolean('tooltip', (e) => {
      if (e.changing) e.ctx.props.tooltip = Boolean(e.changing.next) ? 'My Tooltip' : undefined;
      e.boolean.current = Boolean(e.ctx.props.tooltip);
    });

    e.hr(1, 0.1);

    e.boolean('show: prefix', (e) => {
      const props = e.ctx.props;
      if (e.changing) props.prefix = e.changing.next ? <div>prefix</div> : undefined;
      e.boolean.current = Boolean(props.prefix);
    });

    e.boolean('show: suffix', (e) => {
      const props = e.ctx.props;
      if (e.changing) props.suffix = e.changing.next ? <Icons.QRCode size={14} /> : undefined;
      e.boolean.current = Boolean(props.suffix);
    });

    e.hr();
  })

  .items((e) => {
    e.title('Body');

    e.button('clear (undefined)', (e) => (e.ctx.props.body = undefined));
    e.hr(1, 0.1);

    e.button('single text', (e) => (e.ctx.props.body = 'My Chipper Chip'));
    e.button('single element (button)', (e) => (e.ctx.props.body = <Button>My Button</Button>));
    e.hr(1, 0.1);

    e.button('add (text)', (e) => {
      const body = (e.ctx.props.body = Chip.toBodyArray(e.ctx.props.body));
      const text = `item-${body.length + 1}`;
      body.push(text);
    });

    e.button('add (button)', (e) => {
      const body = (e.ctx.props.body = Chip.toBodyArray(e.ctx.props.body));
      const text = `item-${body.length + 1}`;
      body.push(<Button>{text}</Button>);
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
    e.settings({
      host: { background: -0.04 },
      layout: { cropmarks: -0.2 },
    });
    e.render(<Chip {...e.ctx.props} />);
  });

export default actions;
