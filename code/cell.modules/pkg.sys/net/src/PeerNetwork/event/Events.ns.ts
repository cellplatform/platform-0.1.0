import { t } from '../common';

const NAMESPACES = {
  base: 'sys.net',
  peer: {
    base: 'sys.net/peer',
    data: 'sys.net/peer/data',
    connection: 'sys.net/peer/connection',
    local: 'sys.net/peer/local',
  },
  group: {
    base: 'sys.net/group',
  },
};

/**
 * Event namespace index and helpers.
 */
export const EventNamespace = {
  ...NAMESPACES,

  /**
   * Flag filters for event namespaces.
   */
  is: {
    base: isMatchHandler(NAMESPACES.base),
    peer: {
      base: isMatchHandler(NAMESPACES.peer.base),
      data: isMatchHandler(NAMESPACES.peer.data),
      connection: isMatchHandler(NAMESPACES.peer.connection),
      local: isMatchHandler(NAMESPACES.peer.local),
    },
    group: {
      base: isMatchHandler(NAMESPACES.group.base),
    },
  },
};

/**
 * [Helpers]
 */
function isMatch(e: t.Event, ...prefixes: string[]) {
  return prefixes.some((prefix) => e.type.startsWith(`${prefix}/`));
}

function isMatchHandler(...prefixes: string[]) {
  return (e: t.Event) => isMatch(e, ...prefixes);
}
