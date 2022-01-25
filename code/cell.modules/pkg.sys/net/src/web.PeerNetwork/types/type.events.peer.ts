import { t } from './common';

/**
 * TODO 🐷
 * - update and apply to events object.
 */

/**
 * Event API for interacting with network peers.
 */
export type PeerEvents = t.Disposable & {
  $: t.Observable<t.PeerEvent>;
  ns: PeerEventNamespace;
};

export type PeerEventNamespace = {
  is: {
    base(input: any): boolean;
    peer: {
      base(input: any): boolean;
      data(input: any): boolean;
      connection(input: any): boolean;
      local(input: any): boolean;
    };
    group: {
      base(input: any): boolean;
    };
    fs: {
      base(input: any): boolean;
    };
  };
};
