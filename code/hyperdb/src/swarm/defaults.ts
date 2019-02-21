/**
 * See:
 *  - https://github.com/datproject/dat-swarm-defaults
 *  - https://github.com/mafintosh/discovery-swarm
 *  - https://github.com/maxogden/discovery-channel
 */

import { ISwarm } from './types';

const DAT_DOMAIN = 'dat.local';
const DEFAULT_DISCOVERY = ['discovery1.datprotocol.com', 'discovery2.datprotocol.com'];
const DEFAULT_BOOTSTRAP = [
  'bootstrap1.datprotocol.com:6881',
  'bootstrap2.datprotocol.com:6881',
  'bootstrap3.datprotocol.com:6881',
  'bootstrap4.datprotocol.com:6881',
];

const DEFAULT_OPTS = {
  dns: { server: DEFAULT_DISCOVERY, domain: DAT_DOMAIN },
  dht: { bootstrap: DEFAULT_BOOTSTRAP },
};

export default (options: Partial<ISwarm>) => {
  return { ...DEFAULT_OPTS, ...options };
};
