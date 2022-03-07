import React, { useRef } from 'react';
import { ListChildComponentProps } from 'react-window';

import { k } from './common';

type C = k.ListItemClick;
type H = k.ListItemHover;

export type ListVirtualRowData = {
  item: k.ListItem;
  render(): JSX.Element;
  onClick(e: { mouse: C['mouse']; button: C['button'] }): void;
  onHover(e: { isOver: H['isOver']; mouse: C['mouse'] }): void;
};

export const ListVirtualRow: React.FC<ListChildComponentProps> = (props) => {
  const { index } = props;
  const data = props.data(index) as ListVirtualRowData;

  const isDownRef = useRef(false);

  const fireClick = (mouse: C['mouse'], button: C['button'] = 'Left') => {
    isDownRef.current = mouse === 'Down';
    data.onClick({ mouse: mouse, button });
  };

  const clickHandler = (stage: C['mouse']) => {
    return (e: React.MouseEvent) => {
      const button = e.button === 2 ? 'Right' : 'Left';
      fireClick(stage, button);
    };
  };

  const hoverHandler = (isOver: boolean) => {
    return (e: React.MouseEvent) => {
      const mouse: H['mouse'] = isOver ? (isDownRef.current ? 'Down' : 'Up') : 'Up';
      data.onHover({ isOver, mouse });
      if (!isOver) isDownRef.current = false;
    };
  };

  return (
    <div
      key={`row.${index}`}
      style={props.style}
      onMouseDown={clickHandler('Down')}
      onMouseUp={clickHandler('Up')}
      onMouseEnter={hoverHandler(true)}
      onMouseLeave={hoverHandler(false)}
    >
      {data.render()}
    </div>
  );
};
