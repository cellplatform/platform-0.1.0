import React from 'react';

import { constants, css, defaultValue, t, time } from '../../common';
import { Group } from './View.Group';

export type ViewProps = t.ActionPanelProps & {
  model: t.ActionModel<any>;
  getContext?: () => any;
};

export const View: React.FC<ViewProps> = (props) => {
  const scrollable = defaultValue(props.scrollable, true);
  const { model } = props;

  const styles = {
    base: css({
      Scroll: scrollable,
      overflowY: scrollable ? 'scroll' : 'hidden',
      fontFamily: constants.FONT.SANS,
      userSelect: 'none',
      boxSizing: 'border-box',
      paddingBottom: 50,
    }),
  };

  const onItemClick: t.ActionItemClickEventHandler = (e) => {
    const ctx = props.getContext ? props.getContext() : undefined;
    time.delay(0, () => {
      // NB: Delay for a tick to make focus related actions simpler within the handler.
      if (e.model.type === 'button' && e.model.onClick) e.model.onClick(ctx);
    });
  };

  return (
    <div {...css(styles.base, props.style)} className={'uih-ActionPanel'}>
      <Group items={model.items} onItemClick={onItemClick} />
    </div>
  );
};
