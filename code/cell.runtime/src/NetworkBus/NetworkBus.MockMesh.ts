import { t } from './common';
import { NetworkBusMock } from './NetworkBus.Mock';

/**
 * A mock network mesh of event buses.
 */
export function NetworkBusMockMesh<E extends t.Event = t.Event>(
  length: number,
  options: { log?: boolean } = {},
) {
  const { log } = options;

  const mocks = Array.from({ length }).map((v, i) => {
    const local = `peer:${i + 1}`;
    return NetworkBusMock<E>({ local, log });
  });

  mocks.forEach((netbus) => {
    mocks
      .filter((item) => item.mock.local !== netbus.mock.local)
      .forEach((remote) => netbus.mock.remote(remote.mock.local, remote));
  });

  return mocks;
}
