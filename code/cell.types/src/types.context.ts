/**
 * The React [Context] used to pass down common modules to components.
 *
 * To use add a static `contextType` to the consuming component,
 * eg:
 *
 *      import { cell } from '@platform/cell.ui'
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = cell.Context;
 *        public context!: cell.ICellContext
 *      }
 *
 * See:
 *    https://reactjs.org/docs/context.html
 */
export type ICellContext = {};
