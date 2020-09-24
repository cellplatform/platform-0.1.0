// import { node } from './ShellBuilder.node';

import { t } from '../common';

/**
 *
 */
export function builder(args: { bus: t.EventBus; module: t.IModule; parent?: string }) {
  const { bus, module } = args;

  console.log('module.id', module.id);
  //
}

export const ShellBuilder = {
  builder,
};
