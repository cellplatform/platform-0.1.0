import { t, CmdCard } from '../common';
import { Body } from '../ui/Body';
import { FsPathList } from '../../Fs.PathList';

/**
 * Logic controller for the Filesystem <Cmd.Card>
 */
export function FsCardController(args: t.CmdCardControllerArgs) {
  console.log('controller', args);

  const instance = args.instance as t.FsViewInstance;

  // console.log('instance', instance);
  // const fs = instance.fs;
  // console.log('fs', fs);

  //
  const initial = CmdCard.defaultState({
    body: {
      render: Body.render,
      state: { instance: instance as any /* TEMP */ },
    },
    // body: { render: SampleRenderer.body },
    // backdrop: { render: SampleRenderer.backdrop },
  });

  const card = CmdCard.Controller({ ...args, initial });
  const patch = card.state.patch;

  // Command-bar.
  card.commandbar.onExecuteCommand(async (e) => {
    //
    console.log('DEV onExecuteCommand', e);

    await patch((state) => (state.commandbar.textbox.spinning = true));
  });

  return card;
}
