import { take } from 'rxjs/operators';

import { Filesystem, t } from '../node/common';
import { VimeoBus as VimeoBusWeb } from '../web.Bus';
import { BusController as Controller } from './BusController';

type DirPath = string;
type InstanceId = string;

export const VimeoBus = {
  ...VimeoBusWeb,
  Controller,

  /**
   * Simple initialization using a [node-js] filesystem.
   */
  create(args: { token: string; dir: DirPath; bus?: t.EventBus<any>; id?: InstanceId }) {
    const { token, id } = args;
    const { fs, bus, store } = Filesystem.create({ dir: args.dir, bus: args.bus });

    const controller = VimeoBus.Controller({ id, token, bus, fs });
    const events = controller.events;

    events.dispose$.pipe(take(1)).subscribe((e) => store.dispose());
    return events;
  },
};
