import React from 'react';
import { css, CssValue } from '../../common';

type Edge = 'N' | 'S' | 'W' | 'E';
type P = number | null;
type Position = [P, P, P, P];

export type TextCopyIconProps = {
  element: JSX.Element | (() => JSX.Element);
  edge?: Edge;
  offset?: number;
  style?: CssValue;
};

export const TextCopyIcon: React.FC<TextCopyIconProps> = (props) => {
  const edge = toEdgePosition(props.edge ?? 'E', props.offset);

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: edge.base, pointerEvents: 'none' }),
    body: css({ Absolute: edge.body, Flex: 'y-center-center' }),
  };

  const elIcon = typeof props.element === 'function' ? props.element() : props.element;

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.body}>{elIcon}</div>
    </div>
  );
};

/**
 * [Helpers]
 */

function toEdgePosition(edge: Edge, offset = 0): { base: Position; body: Position } {
  if (edge === 'N') {
    return { base: [0 - offset, 0, null, 0], body: [null, 0, 0, 0] };
  }
  if (edge === 'S') {
    return { base: [null, 0, 0 - offset, 0], body: [0, 0, null, 0] };
  }
  if (edge === 'W') {
    return { base: [0, null, 0, 0 - offset], body: [0, 0, 0, null] };
  }
  if (edge === 'E') {
    return { base: [0, 0 - offset, 0, null], body: [0, null, 0, 0] };
  }
  throw new Error(`Edge "${edge}" not supported`);
}
