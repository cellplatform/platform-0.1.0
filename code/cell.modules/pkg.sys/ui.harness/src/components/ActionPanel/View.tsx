import React, { useRef } from 'react';

import { constants, css, defaultValue, t, toActionPanelModel } from '../../common';
import { Item } from './View.Item';
import { Title } from './View.Title';

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
    body: css({ fontSize: 14 }),
    list: css({}),
  };

  const onItemClick: t.ActionItemClickEventHandler = (e) => {
    if (model.getContext) {
      const prev = ctxRef.current;
      ctxRef.current = model.getContext(prev);
    }
    if (e.model.type === 'button') {
      e.model.onClick(ctxRef.current);
    }
  };

  const elTitle = model.name && <Title>{model.name}</Title>;

  return (
    <div {...css(styles.base, props.style)} className={'foo'}>
      <div {...styles.body}>
        {elTitle}
        <div {...styles.list}>
          {model.items.map((item, i) => {
            return <Item key={i} model={item} onClick={onItemClick} />;
          })}
        </div>
      </div>
    </div>
  );
};
