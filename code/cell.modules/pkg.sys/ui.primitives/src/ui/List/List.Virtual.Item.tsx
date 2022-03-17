import React, { useEffect, useState } from 'react';

import { ListChildComponentProps } from 'react-window';

import { t } from './common';

export type ListVirtualItemProps = {
  item: t.ListItem;
  render(): JSX.Element;
};

export const ListVirtualItem: React.FC<ListChildComponentProps> = (props) => {
  const { index } = props;
  const data = props.data(index) as ListVirtualItemProps;
  const el = data.render();
  return <div style={props.style}>{el}</div>;
};
