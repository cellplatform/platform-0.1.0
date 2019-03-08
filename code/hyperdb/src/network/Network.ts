import * as crypto from 'crypto';
import * as t from '../types';
import { Db } from '../db';
import { Socket } from 'net';

const network = require('@hyperswarm/network');
const pump = require('pump');

type INetworkArgs = { db: Db };

/**
 * Manages the network swarm for a single hyperdb.
 */
export class Network {
  /**
   * [Static]
   */
  public static async create(args: INetworkArgs) {
    const network = new Network(args);
    await network.ready;
    return network;
  }

  /**
   * [Constructor]
   */
  constructor(args: INetworkArgs) {
    const db = (this.db = args.db);
    const $key = db.key;
    const net = (this._.net = network());
    const id = (this._.id = crypto
      .createHash('sha256')
      .update($key)
      .digest());

    // const isPrimary = db.key === db.localKey;

    this.ready = new Promise(async (resolve, reject) => {
      try {
        // await
        console.log('-------------------------------------------');
        const isHolePunchable = await this.isHolePunchable();
        if (!isHolePunchable) {
          const err = 'Network cannot be hole-punched.';
          console.log('err', err);
          throw new Error(err);
        }

        // return resolve({});

        // net.join(id, { lookup: !isPrimary, announce: isPrimary });
        net.join(id, { lookup: true, announce: true });

        net.on('connection', (socket: Socket) => {
          const rep = db.replicate({ live: true }) as t.IProtocol;
          // socket.pipe
          console.log('got connection');
          // socket.allow

          pump(rep, socket, rep, function() {
            console.log(`Socket Pipe End | ${db.key}`);
          });

          // rep
          //   .pipe(socket)
          //   .pipe(rep as any)
          //   .on('end', function() {
          //     console.log('socket1 pipe end');
          //   });

          socket.on('data', (data: any) => {
            console.log('socket1 got data', data.toString());
          });

          resolve({});
        });
      } catch (error) {
        console.log('error', error);
        reject(error);
      }
    });
  }

  /**
   * [Fields]
   */
  public readonly ready: Promise<{}>;
  public readonly db: Db;
  private readonly _ = {
    net: undefined as any,
    id: (undefined as unknown) as Buffer,
    // dispose$: new Subject(),
  };

  /**
   * [Properties]
   */
  public get id() {
    return this._.id.toString('hex');
  }

  /**
   * [Methods]
   */

  // public dispose() {
  //   this.unwatch();
  //   this.isDisposed = true;
  //   this._.events$.complete();
  //   this._.dispose$.next();
  // }

  public isHolePunchable() {
    return new Promise<boolean>(resolve => {
      this._.net.discovery.holepunchable((err: Error, yes: boolean) => {
        resolve(yes && !err);
      });
    });
  }

  // public async connect() {}

  /**
   * INTERNAL
   */
}
