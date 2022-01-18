import { CrdtBus } from '..';
import { rx, t } from '../common';
import { NetworkBusMocks } from 'sys.runtime.web';

type O = Record<string, unknown>;

export async function TestNetwork<D extends O>(args: {
  total: number;
  initial: D;
  memorylog?: boolean;
  debounce?: number;
}) {
  const { memorylog = true, debounce = 0 } = args;
  const mocks = NetworkBusMocks<t.CrdtEvent>(args.total, { memorylog });

  const peers = await Promise.all(
    mocks.map((netbus) => {
      const id = netbus.mock.local;
      const bus = rx.bus();
      const ctrl = CrdtBus.Controller({ id, bus, sync: { netbus, debounce } });
      const { events, dispose } = ctrl;
      const doc = (id: string, initial?: D) => {
        return events.doc<D>({ id, initial: initial ?? args.initial });
      };
      return { id, netbus, ctrl, events, doc, dispose };
    }),
  );

  const dispose = () => peers.forEach((peer) => peer.dispose());
  const docs = (id: string) => Promise.all(peers.map((p) => p.doc(id)));

  return { peers, docs, dispose };
}
