import { CssValue as t } from '@platform/css';

/**
 * An <Icon> component function.
 */
export type IIcon = (props: IIconProps) => JSX.Element;

/**
 * Display properties for an icon.
 */
export type IIconProps = {
  size?: number;
  color?: number | string;
  opacity?: number;
  style?: t;
  onClick?: React.MouseEventHandler;
  onDoubleClick?: React.MouseEventHandler;
  onMouseDown?: React.MouseEventHandler;
  onMouseUp?: React.MouseEventHandler;
  onMouseEnter?: React.MouseEventHandler;
  onMouseLeave?: React.MouseEventHandler;
};
