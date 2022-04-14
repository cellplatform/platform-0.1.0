import { t, CmdCard } from '../common';
// import { ModuleCardEvents } from '../Events';
import { Util } from './Util';

/**
 * State controller for the <ModuleCard>.
 */
export function ModuleCardController(args: t.CmdCardControllerArgs) {
  const initial = args.initial ?? Util.defaultState();

  const card = CmdCard.Controller({ ...args, initial });

  // card.commandbar.

  card.commandbar.onExecuteCommand(async (e) => {
    console.log('onExecuteCommand (load module)', e);
    card.state.patch((state) => {
      // state
      state.commandbar.textbox.spinning = true;
    });
  });

  /**
   * TODO 🐷
   */

  return card;
}
