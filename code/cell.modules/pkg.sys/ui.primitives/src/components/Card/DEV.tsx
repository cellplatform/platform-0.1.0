import React from 'react';
import { DevActions } from 'sys.ui.dev';
import { Card, CardProps } from '.';
import { css, color } from '../../common';

type Ctx = { props: CardProps };
const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius, eros nisl euismod ante, ac suscipit elit libero nec dolor. Morbi magna enim, molestie non arcu id, varius sollicitudin neque. In sed quam mauris. Aenean mi nisl, elementum non arcu quis, ultrices tincidunt augue. Vivamus fermentum iaculis tellus finibus porttitor. Nulla eu purus id dolor auctor suscipit. Integer lacinia sapien at ante tempus volutpat.';

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui/Card')
  .context((prev) => {
    if (prev) return prev;
    return {
      props: {
        padding: [25, 30],
        userSelect: true,
      },
    };
  })

  .items((e) => {
    e.title('props');

    e.boolean('userSelect', (e) => {
      if (e.changing) e.ctx.props.userSelect = e.changing.next;
      e.boolean.current = Boolean(e.ctx.props.userSelect);
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

    const elBody = <div {...styles.body}>{LOREM}</div>;
    const elCard = (
      <Card {...e.ctx.props} onClick={(e) => console.log('click', e)}>
        {elBody}
      </Card>
    );

    e.render(elCard);
  });

export default actions;
