import { log } from '@platform/log/lib/server';
import { time } from '@platform/util.value';
import { PeerServer } from 'peer';

const pkg = require('../package.json') as { name: string; version: string };

const timer = time.timer();
const port = 9000;
const key = 'conn';

type Client = {
  getId: () => string;
  getToken: () => string;
  getLastPing: () => number;
};

/**
 *  https://github.com/peers/peerjs-server
 */
const server = PeerServer({ port, key, proxied: true, allow_discovery: true }, (args) => {
  const elapsed = timer.elapsed.toString();
  const address = log.cyan(`http://localhost:${log.white(port)}`);

  log.info();
  log.info.gray(`👋 Running on ${address} [${elapsed}]`);
  log.info();
  log.info.gray(`   • package:   ${pkg.name}@${pkg.version}`);
  log.info.gray(`   • discovery: /${key}/peers`);
  log.info.gray(`   • port:      ${port}`);
  log.info();
});

server.on('connection', (e) => logEvent(log.green('connection'), e));
server.on('disconnect', (e) => logEvent(log.yellow('disconnect'), e));

/**
 * Helpers
 */
function logEvent(name: string, e: Client) {
  const table = log.table({ border: false });
  const add = (label: string, value: string | number) => {
    table.add([' • ', log.gray(label), '  ', log.white(value)]);
  };

  add('id', e.getId());
  add('token', e.getToken());
  add('last ping', e.getLastPing());

  log.info(name);
  log.info(table.toString());
  log.info();
}
