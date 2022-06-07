import React from 'react';
import { DevActions, Lorem, ObjectView } from 'sys.ui.dev';

import { Card, CardProps } from '..';
import { css, t } from '../../common';

type Ctx = { props: CardProps };

const DEFAULT = {
  PADDING: [25, 30] as t.CssEdgesInput,
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Card')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        padding: DEFAULT.PADDING,
        userSelect: true,
        shadow: true,
        showAsCard: true,
      },
    };
    return ctx;
  })

  .items((e) => {
    e.title('props');

    e.boolean('userSelect', (e) => {
      if (e.changing) e.ctx.props.userSelect = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.userSelect);
    });

    e.boolean('shadow', (e) => {
      if (e.changing) e.ctx.props.shadow = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.shadow);
    });

    e.boolean('padding', (e) => {
      if (e.changing) e.ctx.props.padding = e.changing.next ? DEFAULT.PADDING : undefined;
      e.boolean.current = e.ctx.props.padding !== undefined;
    });

    e.boolean('margin', (e) => {
      if (e.changing) e.ctx.props.margin = e.changing.next ? 30 : undefined;
      e.boolean.current = e.ctx.props.margin !== undefined;
    });

    e.boolean('showAsCard', (e) => {
      if (e.changing) e.ctx.props.showAsCard = e.changing.next;
      e.boolean.current = e.ctx.props.showAsCard;
    });

    e.hr();
  })

  .items((e) => {
    e.component((e) => {
      return <ObjectView name={'props'} data={e.ctx.props} style={{ MarginX: 15 }} fontSize={10} />;
    });
  })

  .subject((e) => {
    e.settings({
      host: { background: -0.04 },
      layout: {
        label: '<Card>',
        cropmarks: -0.2,
        width: 450,
      },
    });

    const styles = {
      base: css({}),
      body: css({
        backgroundColor: 'rgba(255, 0, 0, 0.05)' /* RED */,
      }),
    };

    const elBody = <div {...styles.body}>{Lorem.toString()}</div>;
    const elCard = (
      <Card {...e.ctx.props} onClick={(e) => console.log('click', e)}>
        {elBody}
      </Card>
    );

    e.render(elCard);
  });

export default actions;
