import React from 'react';
import { ListChildComponentProps } from 'react-window';

import { k } from './common';

type C = k.ListClick;
type M = C['mouse'];
type B = C['button'];

export type ListVirtualRowData = {
  item: k.ListItem;
  render(): JSX.Element;
  onMouse(e: { mouse: M; button: B }): void;
};

export const ListVirtualRow: React.FC<ListChildComponentProps> = (props) => {
  const { index } = props;
  const data = props.data(index) as ListVirtualRowData;

  const mouseHandler = (mouse: M) => {
    return (e: React.MouseEvent) => {
      const button = e.button === 2 ? 'Right' : 'Left';
      data.onMouse({ mouse, button });
    };
  };

  return (
    <div
      key={`row.${index}`}
      style={props.style}
      onMouseDown={mouseHandler('Down')}
      onMouseUp={mouseHandler('Up')}
    >
      {data.render()}
    </div>
  );
};
