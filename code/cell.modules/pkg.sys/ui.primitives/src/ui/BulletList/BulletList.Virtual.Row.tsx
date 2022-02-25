import React, { useEffect, useRef, useState } from 'react';
import { color, COLORS, css, CssValue, k } from './common';

import { ListChildComponentProps } from 'react-window';

export type BulletListVirtualRowData = {
  item: k.BulletItem;
  render: (style: CssValue) => JSX.Element;
};

export const BulletListVirtualRow: React.FC<ListChildComponentProps> = (props) => {
  const data = props.data(props.index) as BulletListVirtualRowData;
  return data.render(props.style);
};
