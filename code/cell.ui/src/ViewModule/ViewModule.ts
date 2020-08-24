import { Module } from '@platform/cell.module';

import { Context, provider } from './Context';

import { t } from '../common';
import { create } from './ViewModule.create';
import { events } from './ViewModule.events';
import { fire } from './ViewModule.fire';

export const ViewModule: t.ViewModule = {
  ...Module,
  create,
  events,
  fire,

  /**
   * The React [Context] used to pass down common modules to components.
   *
   * To use add a static `contextType` to the consuming component,
   * eg:
   *
   *      export class MyView extends React.PureComponent {
   *        public static contextType = ViewModule.Context;
   *        public context!: t.MyContext
   *      }
   *
   * See:
   *    https://reactjs.org/docs/context.html
   */
  Context,
  provider,
};
