import { t } from '../node/common';

import { BusController as BusControllerWeb } from '../web.Bus/BusController';
import { VimeoHttp } from '../node.VimeoHttp';

type InstanceId = string;

/**
 * Event controller.
 */
export function BusController(args: {
  token: string;
  id?: InstanceId;
  fs: t.Fs;
  bus: t.EventBus<any>;
  filter?: (e: t.VimeoEvent) => boolean;
}) {
  const { token, fs } = args;
  const http = VimeoHttp({ token, fs });
  return BusControllerWeb({ ...args, http });
}
