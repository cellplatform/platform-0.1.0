import { t, CmdCard } from '../common';
// import { ModuleCardEvents } from '../Events';
import { Util } from './Util';

/**
 * State controller for the <ModuleCard>.
 */
export function ModuleCardController(args: t.CmdCardStateControllerArgs) {
  const initial = args.initial ?? Util.defaultState();

  const card = CmdCard.State.Controller({ ...args, initial });

  /**
   * TODO 🐷
   */

  card.state$.subscribe((e) => {
    console.log('Module Card Controller $:', e);
  });

  return card;
}
