import React, { useMemo } from 'react';
import { color, COLORS, css, CssValue } from '../../common';
import { LabelChip } from './Layout.LabelChip';

export type LayoutLabelProps = { style?: CssValue };

export const LayoutLabel: React.FC<LayoutLabelProps> = (props) => {
  const label = useMemo(() => formatTodo(props.children), [props.children]);
  return <>{label}</>;
};

/**
 * [Helpers]
 */

function formatTodo(children?: React.ReactNode) {
  if (typeof children !== 'string') return children;

  const match = /\[TODO\]/g.exec(children);
  if (!Array.isArray(match)) return children;

  const value = match[0];
  const index = match.index;
  const left = match.input.substring(0, index).trimRight();
  const right = match.input.substring(index + value.length).trimLeft();

  return (
    <>
      {left} <LabelChip>TODO</LabelChip> {right}
    </>
  );
}

// /**
//  * Display chip
//  */
// const Chip: React.FC = (props) => {
//   const styles = {
//     base: css({
//       display: 'inline-block',
//       backgroundColor: COLORS.CLI.MAGENTA,
//       color: COLORS.WHITE,
//       fontSize: 11,
//       border: `solid 1px ${color.format(-0.03)}`,
//       boxSizing: 'border-box',
//       borderRadius: 2,
//       paddingTop: 1,
//       PaddingX: 4,
//     }),
//   };
//   return <div {...styles.base}>{props.children}</div>;
// };
