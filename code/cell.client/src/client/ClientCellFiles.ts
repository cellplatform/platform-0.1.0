import { t, Uri, Schema } from '../common';
import { ClientFile } from './ClientFile';

export type IClientCellFilesArgs = { parent: t.IClientCell; map: t.IFileMap; urls: t.IUrls };

/**
 * HTTP client for operating on a [Cell]'s links.
 */
export class ClientCellFiles implements t.IClientCellFiles {
  public static create(args: IClientCellFilesArgs): t.IClientCellFiles {
    return new ClientCellFiles(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IClientCellFilesArgs) {
    this.args = args;
    this.map = args.map;
  }

  /**
   * [Fields]
   */
  public readonly map: t.IFileMap;
  private readonly args: IClientCellFilesArgs;
  private _list: t.IClientCellFiles['list'];

  /**
   * [Properties]
   */
  public get list() {
    if (!this._list) {
      const map = this.map;
      const ns = this.args.parent.uri.parts.ns;
      this._list = Object.keys(map).reduce((acc, fileid) => {
        const value = map[fileid];
        if (value) {
          const uri = Schema.uri.create.file(ns, fileid);
          acc.push({ uri, ...value });
        }
        return acc;
      }, [] as t.IClientCellFiles['list']);
    }
    return this._list;
  }
}
