import React from 'react';
import { DevActions, lorem } from 'sys.ui.dev';

import { Card, CardProps } from '..';
import { css } from '../../../common';

type Ctx = { props: CardProps };

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.Card')
  .context((e) => {
    if (e.prev) return e.prev;
    const ctx: Ctx = {
      props: {
        padding: [25, 30],
        userSelect: true,
        shadow: true,
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

    e.hr();
  })

  .subject((e) => {
    e.settings({
      layout: {
        cropmarks: -0.2,
        background: 1,
        label: '<Card>',
        width: 450,
      },
      host: { background: -0.04 },
    });

    const styles = {
      base: css({}),
      body: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      }),
    };

    const elBody = <div {...styles.body}>{lorem.toString()}</div>;
    const elCard = (
      <Card {...e.ctx.props} onClick={(e) => console.log('click', e)}>
        {elBody}
      </Card>
    );

    e.render(elCard);
  });

export default actions;
