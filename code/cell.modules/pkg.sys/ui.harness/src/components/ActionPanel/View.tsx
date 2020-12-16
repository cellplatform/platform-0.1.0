import React, { useRef } from 'react';

import { constants, css, defaultValue, t, toActionPanelModel } from '../../common';
import { Group } from './View.Group';

export type ViewProps = t.ActionPanelProps & {
  actions?: t.ActionModelBuilder<any> | t.ActionModel<any> | t.ActionModelState<any>;
};

export const View: React.FC<ViewProps> = (props) => {
  const ctxRef = useRef();
  const model = toActionPanelModel(props.actions) || constants.DEFAULT.ACTIONS;
  const scrollable = defaultValue(props.scrollable, true);

  const styles = {
    base: css({
      Scroll: scrollable,
      overflowY: scrollable ? 'scroll' : 'hidden',
      userSelect: 'none',
      fontFamily: constants.FONT.SANS,
    }),
  };

  const onItemClick: t.ActionItemClickEventHandler = (e) => {
    if (model.getContext) {
      const prev = ctxRef.current;
      ctxRef.current = model.getContext(prev);
    }
    if (e.model.type === 'button' && e.model.onClick) {
      e.model.onClick(ctxRef.current);
    }
  };

  return (
    <div {...css(styles.base, props.style)} className={'foo'}>
      <Group items={model.items} onItemClick={onItemClick} />
    </div>
  );
};
