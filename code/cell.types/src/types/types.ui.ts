import { t } from '../common';

/**
 * The React [Context] used to pass down common modules to components.
 *
 * To use add a static `contextType` to the consuming component,
 * eg:
 *
 *      import { ui } from '@platform/cell.ui'
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = ui.Context;
 *        public context!: ui.IEnvContext
 *      }
 *
 * See:
 *    https://reactjs.org/docs/context.html
 *
 */
export type IEnvContext<E = t.EnvEvent> = {
  env: t.IEnv<E>;
  client: t.IClientTypesystem;
};
