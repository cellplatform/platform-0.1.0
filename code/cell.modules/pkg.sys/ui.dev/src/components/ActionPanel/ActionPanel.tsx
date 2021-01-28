import React from 'react';

import { constants, css, defaultValue, t, hash } from '../../common';
import { useActionPanelController, useRedraw } from '../../hooks/Actions';
import { Item } from './Item';

export type ActionPanelProps = t.ActionPanelProps & {
  bus: t.EventBus;
  actions: t.DevActions<any>;
};

export const ActionPanel: React.FC<ActionPanelProps> = (props) => {
  const { actions } = props;
  const scrollable = defaultValue(props.scrollable, true);
  const bus = props.bus.type<t.DevEvent>();
  const model = actions.toObject();
  const { ns, items } = model;

  useActionPanelController({ bus, actions });
  useRedraw({
    name: '<ActionPanel>',
    bus,
    actions,
    paths: ['ctx/current', 'items', 'initialized'],
  });

  const styles = {
    base: css({
      Scroll: scrollable,
      overflowY: scrollable ? 'scroll' : 'hidden',
      userSelect: 'none',
      boxSizing: 'border-box',
      color: constants.COLORS.DARK,
      fontFamily: constants.FONT.SANS,
      fontSize: 14,
    }),
    spacer: css({ height: 80 }),
  };

  const elItems = items.map((item) => {
    const key = hash.sha256(item);
    return <Item key={key} ns={ns} model={item} bus={bus} />;
  });

  return (
    <div {...css(styles.base, props.style)} className={'dev-ActionPanel'}>
      {elItems}
      {items.length > 0 && <div {...styles.spacer} />}
    </div>
  );
};
