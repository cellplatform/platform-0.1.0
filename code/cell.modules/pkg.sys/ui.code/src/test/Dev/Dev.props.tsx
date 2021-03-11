// import React from 'react';
// import { css, CssValue, t, color, COLORS } from '../../common';

// import { ObjectView } from '@platform/ui.object';

// export type DevPropsProps = {
//   id?: string;
//   selection?: t.CodeEditorSelection;
//   style?: CssValue;
// };

// export const DevProps: React.FC<DevPropsProps> = (props) => {
//   const styles = {
//     base: css({
//       boxSizing: 'border-box',
//       backgroundColor: color.format(-0.03),
//       borderTop: `solid 1px ${color.format(-0.1)}`,
//       fontFamily: 'Menlo, monospace',
//       fontSize: 12,
//       color: COLORS.DARK,
//     }),
//     title: css({
//       padding: 8,
//       borderBottom: `solid 1px ${color.format(-0.1)}`,
//     }),
//     body: css({
//       padding: 8,
//     }),
//   };

//   return (
//     <div {...css(styles.base, props.style)}>
//       <div {...styles.title}>editor: {props.id}</div>
//       <div {...styles.body}>
//         <ObjectView
//           name={'selection'}
//           data={props.selection}
//           expandPaths={['$.cursor']}
//           fontSize={11}
//         />
//       </div>
//     </div>
//   );
// };
