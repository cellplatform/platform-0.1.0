import * as t from '../../types';
import { Subject } from 'rxjs';
import { CommandLineEvent } from './types';

import { root } from './commands';
import { CommandState } from '../common';

export * from './commands';
export * from './types';

export const events$ = new Subject<CommandLineEvent>();

/**
 * Initializes the CLI structure.
 */
export function init(args: { ipc: t.IpcClient; db: t.IDbRendererFactory }): t.ICommandLine {
  const { ipc, db } = args;
  const state = CommandState.create({ root });
  return {
    events$,
    state,
    db,
  };
}
