import React, { useRef } from 'react';

import { constants, css, CssValue, defaultValue, t } from '../../common';
import { ActionBuilder } from '../../config';
import { ActionItemClickEventHandler, ActionPanelItem } from './ActionPanelItem';
import { ActionPanelTitle } from './ActionPanelTitle';

export type ActionPanelProps = {
  style?: CssValue;
  actions?: t.ActionModelBuilder<any> | t.ActionModel<any> | t.ActionModelState<any>;
  showTitle?: boolean;
};

export const Component: React.FC<ActionPanelProps> = (props) => {
  const model = ActionBuilder.toModel(props.actions) || ActionBuilder.model().state;
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

/**
 * Attach additional properties to the component.
 */
type A = React.FC<ActionPanelProps> & { build: t.ActionModelFactory['builder'] };
(Component as A).build = ActionBuilder.builder;
export const ActionPanel = Component as A;
export default ActionPanel;
