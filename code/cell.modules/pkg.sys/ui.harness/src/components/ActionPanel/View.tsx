import React, { useRef } from 'react';

import { constants, css, CssValue, defaultValue, t, toActionPanelModel } from '../../common';
import { ActionItemClickEventHandler, ActionPanelItem } from './View.Item';
import { ActionPanelTitle } from './View.Title';

export type ViewProps = t.ActionPanelProps & {
  actions?: t.ActionModelBuilder<any> | t.ActionModel<any> | t.ActionModelState<any>;
};

export const View: React.FC<ViewProps> = (props) => {
  const model = toActionPanelModel(props.actions) || constants.DEFAULT.ACTIONS;
  const ctxRef = useRef();

  const styles = {
    base: css({
      Scroll: true,
      position: 'relative',
      userSelect: 'none',
      fontFamily: constants.FONT.SANS,
    }),
    body: css({ fontSize: 14 }),
    list: css({}),
  };

  const onItemClick: ActionItemClickEventHandler = (e) => {
    if (model.getContext) {
      const prev = ctxRef.current;
      ctxRef.current = model.getContext(prev);
    }
    e.model.onClick(ctxRef.current);
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>
        {defaultValue(props.showTitle, true) && <ActionPanelTitle>{model.name}</ActionPanelTitle>}
        <div {...styles.list}>
          {model.items.map((item, i) => {
            return <ActionPanelItem key={i} model={item} onClick={onItemClick} />;
          })}
        </div>
      </div>
    </div>
  );
};
