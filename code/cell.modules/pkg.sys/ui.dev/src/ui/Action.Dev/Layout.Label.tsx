import React, { useMemo } from 'react';
import { CssValue } from '../../common';
import { Format } from '../Action.Display/util';

export type LayoutLabelProps = {
  children?: React.ReactNode;
  style?: CssValue;
};

export const LayoutLabel: React.FC<LayoutLabelProps> = (props) => {
  const label = useMemo(() => Format.todo(props.children), [props.children]);
  return <>{label}</>;
};
