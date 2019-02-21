/**
 * See:
 *  - https://github.com/mafintosh/hyperdb
 */
const hyperdb = require('hyperdb');
import { HyperDb } from './main.HyperDB';

export { HyperDb };

export type ICreateDbArgs = {
  /**
   * Directory to save DB files within.
   * Or a function to [storage]
   *  - https://github.com/mafintosh/hyperdb#api
   *  - https://github.com/random-access-storage/random-access-file
   */
  storage: string;

  /**
   * Buffer containing the local feed's public key.
   *    If you do not set this the public key will be loaded from storage.
   *    If no key exists a new key pair will be generated.
   */
  key?: string | Buffer;

  /**
   * Set to true to reduce the nodes array to the first node in it.
   */
  firstNode?: boolean;

  /**
   * Value encoding of data in the DB.
   */
  valueEncoding?: 'binary' | 'utf-8';
};

/**
 * Create a new HyperDB client.
 */
export function create(args: ICreateDbArgs) {
  const reduce = (a: any, b: any) => a;
  const map = (node: any) => node;

  return new Promise<HyperDb>(resolve => {
    const { valueEncoding = 'utf-8' } = args;
    const options = { valueEncoding, reduce, map };
    const instance = args.key
      ? hyperdb(args.storage, args.key, options)
      : hyperdb(args.storage, options);
    instance.on('ready', () => resolve(new HyperDb({ instance })));
  });
}
