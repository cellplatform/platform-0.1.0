import React from 'react';
import { ListChildComponentProps } from 'react-window';

import { t } from './common';

export type ListVirtualRowData = {
  item: t.ListItem;
  render(): JSX.Element;
};

export const ListVirtualRow: React.FC<ListChildComponentProps> = (props) => {
  const { index } = props;
  const data = props.data(index) as ListVirtualRowData;
  return (
    <div key={`row.${index}`} style={props.style}>
      {data.render()}
    </div>
  );
};
