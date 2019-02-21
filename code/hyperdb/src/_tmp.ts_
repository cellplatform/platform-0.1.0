import { value } from './common';

const hyperdb = require('hyperdb');
const discovery = require('discovery-swarm');
const swarmDefaults = require('dat-swarm-defaults');

export type IHyperDB = any;

/**
 *
 */
export async function init(args: { db: string; key?: string }) {
  console.log('context', args);

  console.group('🌳 init db ');
  console.log(' - db', args.db);
  console.log(' - key', args.key);
  console.groupEnd();

  const db = await createDb(args);
  await setupSwarm({ db });

  const dbKey = db.key.toString('hex');
  const localKey = db.local.key.toString('hex');
  return { db, dbKey, localKey };
}

/**
 * Initialize a HyperDB client.
 */
export function createDb(args: { db: string; key?: string }) {
  const reduce = (a: any, b: any) => a;
  return new Promise<IHyperDB>((resolve, reject) => {
    // Join an existing hyperdb where args.key comes from providing index.js with --key <key>
    // or create a new original hyperdb, by not specifying a key
    const options = { valueEncoding: 'utf-8', reduce };
    const db = args.key ? hyperdb(args.db, args.key, options) : hyperdb(args.db, options);
    db.on('ready', () => resolve(db));
  });
}

/**
 * Setup the P2P swarm.
 */
export async function setupSwarm(args: { db: IHyperDB; disableAutoAuth?: boolean }) {
  const { db } = args;
  const disableAutoAuth = value.defaultValue(args.disableAutoAuth, false);

  const dbstr = db.key.toString('hex');
  const swarm = discovery(
    swarmDefaults({
      id: dbstr,
      stream: function(peer: any) {
        console.log('replicate TEMP');
        return db.replicate({
          // TODO: figure out what this truly does
          live: true,
          userData: db.local.key,
        });
      },
    }),
  );
  console.log('TMP/looking for peers using swarm id\n\t', dbstr);

  swarm.join(dbstr);

  // emitted when a new peer joins
  swarm.on('connection', (peer: any) => {
    if (disableAutoAuth) {
      return;
    }
    // initiate auto-authorization:
    // use the local key from the peer, stored in their userData, to authenticate them automatically
    // (thanks substack && JimmyBoh https://github.com/karissa/hyperdiscovery/pull/12#pullrequestreview-95597621 )
    if (!peer.remoteUserData) {
      console.log('peer missing user data');
      return;
    }
    try {
      const remotePeerKey = Buffer.from(peer.remoteUserData);

      db.authorized(remotePeerKey, function(err: Error, auth: any) {
        console.log(remotePeerKey.toString('hex'), 'authorized? ' + auth);
        if (err) {
          return console.log(err);
        }
        if (!auth) {
          db.authorize(remotePeerKey, function(err: Error) {
            if (err) {
              return console.log(err);
            }
            console.log(remotePeerKey.toString('hex'), 'was just authorized!');
          });
        }
      });
    } catch (err) {
      console.error(err);
      return;
    }
  });
  // return the swarm instance
  return { swarm };
}
