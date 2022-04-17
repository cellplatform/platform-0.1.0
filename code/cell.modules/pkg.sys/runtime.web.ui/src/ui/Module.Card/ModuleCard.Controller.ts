import { t, CmdCard } from '../common';
import { Util } from './Util';

/**
 * State controller for the <ModuleCard>.
 */
export function ModuleCardController(args: t.CmdCardControllerArgs): t.CmdCardEventsDisposable {
  const initial = args.initial ?? Util.defaultState();
  const card = CmdCard.Controller({ ...args, initial });

  card.commandbar.onExecuteCommand(async (e) => {
    console.log('onExecuteCommand (load module)', e);

    /**
     * TODO 🐷
     * - monitor load state (stop spinner or raise error on timeout)
     */

    card.state.patch((state) => {
      state.commandbar.textbox.spinning = true;

      const body = state.body.state as t.ModuleCardBodyState;
      body.url = state.commandbar.text;
    });
  });

  /**
   * API
   */
  return card;
}
