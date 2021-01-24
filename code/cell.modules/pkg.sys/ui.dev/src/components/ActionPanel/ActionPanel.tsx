import React from 'react';

import { constants, css, defaultValue, t } from '../../common';
import { Item } from './Item';
import { useActionPanelController } from '../../hooks/actions';

export type ActionPanelProps = t.ActionPanelProps & {
  bus: t.EventBus;
  model: t.DevActionModelState<any>;
};

export const ActionPanel: React.FC<ActionPanelProps> = (props) => {
  const { model } = props;
  const scrollable = defaultValue(props.scrollable, true);
  const bus = props.bus.type<t.DevEvent>();
  const ns = model.state.ns;

  useActionPanelController({ bus, model });

  const styles = {
    base: css({
      Scroll: scrollable,
      overflowY: scrollable ? 'scroll' : 'hidden',
      userSelect: 'none',
      boxSizing: 'border-box',
      paddingBottom: 50,
      fontFamily: constants.FONT.SANS,
      fontSize: 14,
      color: constants.COLORS.DARK,
    }),
  };

  const elItems = model.state.items.map((item, i) => {
    return <Item key={i} ns={ns} model={item} bus={bus} />;
  });

  return (
    <div {...css(styles.base, props.style)} className={'dev-ActionPanel'}>
      {elItems}
    </div>
  );
};
