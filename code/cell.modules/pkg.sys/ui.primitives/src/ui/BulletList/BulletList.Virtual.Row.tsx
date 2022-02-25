import React from 'react';
import { ListChildComponentProps } from 'react-window';

import { k } from './common';

type C = k.BulletListClick;
type M = C['mouse'];
type B = C['button'];

export type BulletListVirtualRowData = {
  item: k.BulletItem;
  render(): JSX.Element;
  onMouse(e: { mouse: M; button: B }): void;
};

export const BulletListVirtualRow: React.FC<ListChildComponentProps> = (props) => {
  const data = props.data(props.index) as BulletListVirtualRowData;
  const el = data.render();

  const mouseHandler = (mouse: M) => {
    return (e: React.MouseEvent) => {
      const button = e.button === 2 ? 'Right' : 'Left';
      data.onMouse({ mouse, button });
    };
  };

  return (
    <div style={props.style} onMouseDown={mouseHandler('Down')} onMouseUp={mouseHandler('Up')}>
      {el}
    </div>
  );
};
