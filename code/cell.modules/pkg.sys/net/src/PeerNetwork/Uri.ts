import { t } from './common';
import { StringUtil } from './util';

/**
 * Network URIs.
 */
export const Uri = {
  connection(kind: t.PeerConnectionKind, peer: t.PeerId, id: string) {
    return `${kind}:${peer}:${StringUtil.formatConnectionId(id)}`;
  },
};
