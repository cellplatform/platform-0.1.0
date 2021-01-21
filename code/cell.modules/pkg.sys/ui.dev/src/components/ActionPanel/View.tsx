import React from 'react';

import { constants, css, defaultValue, t, time } from '../../common';
import { Item } from './Item';

export type ViewProps = t.ActionPanelProps & {
  model: t.DevActionModel<any>;
  getContext?: () => any;
};

export const View: React.FC<ViewProps> = (props) => {
  const scrollable = defaultValue(props.scrollable, true);
  const { model } = props;

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

  const onItemClick: t.DevActionItemClickEventHandler = (e) => {
    const ctx = props.getContext ? props.getContext() : undefined;
    time.delay(0, () => {
      // NB:  Delay for a tick to make focus related actions simpler to
      //      deal with within the handler.
      //      If we do this here, then it does not have to be propogated across
      //      any handler that cares about this.
      if (e.model.type === 'button' && e.model.onClick) e.model.onClick(ctx);
    });
  };

  const elItems = model.items.map((item, i) => {
    return <Item key={i} model={item} onClick={onItemClick} />;
  });

  return (
    <div {...css(styles.base, props.style)} className={'dev-ActionPanel'}>
      {elItems}
    </div>
  );
};
