import React from 'react';

import { css, CssValue, t } from '../../common';
import { Item } from './View.Item';
import { Title } from './View.Title';

export type GroupProps = {
  items: t.ActionItem[];
  name?: string;
  style?: CssValue;
  onItemClick?: t.ActionItemClickEventHandler;
};

export const Group: React.FC<GroupProps> = (props) => {
  const styles = {
    base: css({}),
    body: css({ fontSize: 14 }),
    list: css({}),
  };

  const elItems = props.items.map((item, i) => {
    if (item.type === 'group') {
      // RECURSION 🌳
      return <Group key={i} name={item.name} items={item.items} onItemClick={props.onItemClick} />;
    } else {
      return <Item key={i} model={item} onClick={props.onItemClick} />;
    }
  });

  return (
    <div {...css(styles.base, props.style)} className={'foo'}>
      <div {...styles.body}>
        {props.name && <Title>{props.name}</Title>}
        <div {...styles.list}>{elItems}</div>
      </div>
    </div>
  );
};
