import React from 'react';

import { ListChildComponentProps } from 'react-window';

import { t } from './common';

export type ListVirtualItemProps = {
  item: t.ListItem;
  render(args: { isScrolling: boolean }): JSX.Element;
};

export const ListVirtualItem: React.FC<ListChildComponentProps> = (props) => {
  const { index } = props;
  const isScrolling = Boolean(props.isScrolling);
  const data = props.data(index) as ListVirtualItemProps;
  const el = data.render({ isScrolling });
  return <div style={props.style}>{el}</div>;
};
