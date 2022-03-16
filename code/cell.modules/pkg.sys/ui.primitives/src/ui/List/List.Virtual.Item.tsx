import React from 'react';
import { ListChildComponentProps } from 'react-window';

import { t } from './common';

export type ListVirtualItemProps = {
  item: t.ListItem;
  render(): JSX.Element;
};

export const ListVirtualItem: React.FC<ListChildComponentProps> = (props) => {
  const { index } = props;
  const data = props.data(index) as ListVirtualItemProps;
  return (
    <div key={`item.${index}`} style={props.style}>
      {data.render()}
    </div>
  );
};
