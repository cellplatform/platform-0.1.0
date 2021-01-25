import React from 'react';

import { constants, css, defaultValue, t } from '../../common';
import { useActionPanelController, useRedraw } from '../../hooks/actions';
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
  const ns = model.ns;

  useActionPanelController({ bus, actions });
  useRedraw({ bus, actions, paths: ['ctx/current'] });

  const styles = {
    base: css({
      Scroll: scrollable,
      overflowY: scrollable ? 'scroll' : 'hidden',
      userSelect: 'none',
      boxSizing: 'border-box',
      paddingBottom: 50,
      color: constants.COLORS.DARK,
      fontFamily: constants.FONT.SANS,
      fontSize: 14,
    }),
  };

  const elItems = model.items.map((item, i) => {
    return <Item key={i} ns={ns} model={item} bus={bus} />;
  });

  return (
    <div {...css(styles.base, props.style)} className={'dev-ActionPanel'}>
      {elItems}
    </div>
  );
};
