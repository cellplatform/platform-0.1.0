import { Module as ModuleBase } from '@platform/cell.module';

import { Context, provider } from './Context';

import { t } from '../common';
import { create } from './Module.create';
import { events } from './Module.events';
import { fire } from './Module.fire';

export const Module: t.ViewModule = {
  ...ModuleBase,

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
   *        public static contextType = Module.Context;
   *        public context!: t.MyContext
   *      }
   *
   * See:
   *    https://reactjs.org/docs/context.html
   */
  Context,
  provider,
};
