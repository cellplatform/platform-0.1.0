import { localStorage, t, defaultValue } from '../../common';

const ROOT = 'ROOT';

export type IHistoryItem = {
  namespace: string;
  command: string;
};

export class History {
  /**
   * [Static]
   */
  public static toPrefix(namespace?: string | t.ICommandNamespace) {
    let ns = typeof namespace === 'object' ? namespace.toString() : namespace || '';
    ns = (ns || '').trim() ? ns : ROOT;
    ns = ns.replace(/\:/g, '_');
    return `[${ns}]:`;
  }

  public static toObject(item: string) {
    const parts = (item || '').split(':');
    const namespace = parts[0]
      .replace(/\:$/, '')
      .replace(/^\[/, '')
      .replace(/\]$/, '');
    const command = parts[1];
    return { namespace, command };
  }

  /**
   * [Lifecycle]
   */
  constructor(args: { id?: string; max?: number }) {
    this.id = args.id;
    this.localStorage = localStorage.init(args.id);
    this.max = defaultValue(args.max, 100);
  }

  /**
   * [Fields]
   */
  public readonly id: string | undefined;
  public readonly localStorage: localStorage.IStorage;
  public readonly max: number;

  /**
   * [Properties]
   */
  public get items() {
    return this.localStorage.history || [];
  }

  /**
   * [Methods]
   */

  /**
   * Adds a new item to the history.
   */
  public add(namespace: string | t.ICommandNamespace, command: string) {
    command = (command || '').trim();
    if (!command) {
      return;
    }

    // Prepare the storage string.
    const prefix = History.toPrefix(namespace);
    const item = `${prefix}${command}`;

    // Don't store if the latest item is the same (de-dupe).
    if (this.namespace(namespace)[0] === item) {
      return;
    }

    // Store the items.
    const items = [item, ...this.items].slice(0, this.max);
    this.localStorage.history = items;
  }

  /**
   * Retrieves the history list for the given namespace.
   */
  public namespace(namespace?: string | t.ICommandNamespace) {
    const prefix = History.toPrefix(namespace);
    return this.items.filter(item => item.startsWith(prefix));
  }

  /**
   * Retrieve the previous item
   */
  public get(index: number, namespace?: string | t.ICommandNamespace) {
    const first = this.namespace(namespace)[index];
    return first ? History.toObject(first) : undefined;
  }
}
