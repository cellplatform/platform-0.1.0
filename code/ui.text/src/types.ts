import { GlamorValue, IMouseEventProps } from '@platform/react';

export * from './components/TextInput/types';

export type ITextStyle = {
  color?: number | string;
  fontSize?: number;
  fontWeight?: 'LIGHT' | 'NORMAL' | 'BOLD';
  fontFamily?: string;
  align?: 'LEFT' | 'CENTER' | 'RIGHT';
  italic?: boolean;
  letterSpacing?: number | string;
  lineHeight?: number | string;
  opacity?: number;
  textShadow?: string | Array<number | string>; // [0:offset-y, 1:color.format()]
  uppercase?: boolean;
};

export type ITextProps = ITextStyle &
  IMouseEventProps & {
    className?: string;
    children?: React.ReactNode;
    block?: boolean;
    tooltip?: string;
    cursor?: string;
    isSelectable?: boolean;
    style?: GlamorValue;
  };
