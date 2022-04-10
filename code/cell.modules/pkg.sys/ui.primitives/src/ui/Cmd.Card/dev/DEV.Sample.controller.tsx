import { CmdCard } from '..';
import { t } from '../common';
import { Util } from '../Util';
import { SampleRenderer } from './DEV.Renderers';

/**
 * Sample Controller (Wrapper)
 */
export function DevSampleController(args: t.CmdCardStateControllerArgs) {
  const initial = Util.defaultState({
    body: { render: SampleRenderer.body },
    backdrop: { render: SampleRenderer.backdrop },
  });

  const card = CmdCard.State.Controller({ ...args, initial });

  card.state$.subscribe((e) => {
    console.log('ff', e);
  });

  return card;
}
