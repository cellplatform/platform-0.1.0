import * as React from 'react';

import { color, COLORS, constants, css, defaultValue, GlamorValue } from './common';
import { Button, IButtonProps } from './primitives';

const STYLES = {
  hr: css({
    margin: 0,
    MarginY: 12,
    border: 'none',
    borderTop: `solid 3px ${color.format(0.06)}`,
  }),
  hrDashed: css({
    margin: 0,
    MarginY: 6,
    // marginLeft: 12,
    border: 'none',
    borderTop: `dashed 1px ${color.format(0.2)}`,
  }),
};

export const Hr = () => <hr {...STYLES.hr} />;
export const HrDashed = () => <hr {...STYLES.hrDashed} />;

export const LinkButton = (props: IButtonProps) => {
  const styles = {
    base: css({
      color: COLORS.CLI.CYAN,
      fontSize: 12,
    }),
  };
  return <Button {...props} style={styles.base} />;
};

export const Label = (props: {
  children?: React.ReactNode;
  tooltip?: string;
  color?: string | number;
  style?: GlamorValue;
}) => {
  const styles = {
    base: css({
      fontFamily: constants.MONOSPACE.FAMILY,
      fontSize: 12,
      color: color.format(defaultValue(props.color, 0.5)),
      marginBottom: 6,
      boxSizing: 'border-box',
    }),
  };
  return (
    <div {...css(styles.base, props.style)} title={props.tooltip}>
      {props.children}
    </div>
  );
};

export const Badge = (props: {
  children?: React.ReactNode;
  color: string;
  backgroundColor: string;
  style?: GlamorValue;
}) => {
  const styles = {
    base: css({
      boxSizing: 'border-box',
      display: 'inline-block',
      color: props.color,
      backgroundColor: props.backgroundColor,
      borderRadius: 2,
      marginRight: 5,
      PaddingX: 3,
      PaddignY: 2,
      border: `solid 1px ${color.format(0.2)}`,
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.children}</div>;
};

export const Panel = (props: {
  title?: string;
  children?: React.ReactNode;
  padding?: number;
  style?: GlamorValue;
}) => {
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius: 4,
      backgroundColor: color.format(-0.1),
      MarginY: 15,
      boxShadow: `inset 0 0 10px 0 ${color.format(-0.3)}`,
      border: `solid 1px ${color.format(-0.4)}`,
    }),
    children: css({
      padding: defaultValue(props.padding, 10),
      paddingTop: 0,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <PanelTitle center={props.title} />
      <div {...styles.children}>{props.children}</div>
    </div>
  );
};

export const PanelTitle = (props: {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  style?: GlamorValue;
}) => {
  const styles = {
    base: css({
      fontSize: 12,
      marginBottom: 10,
      paddingBottom: 3,
      PaddingY: 8,
      PaddingX: 8,
      Flex: 'center-spaceBetween',
      borderBottom: `solid 1px ${color.format(-0.3)}`,
      color: color.format(0.5),
      backgroundColor: color.format(-0.1),
      userSelect: 'none',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div>{props.left}</div>
      <div>{props.center}</div>
      <div>{props.right}</div>
    </div>
  );
};
