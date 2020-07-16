import { t, Uri } from '../../common';
import { load } from './util';

type IArgs = {
  client: t.IClientTypesystem;
  uri: string | t.IRowUri;
};

export class AppModel implements t.IAppModel {
  public static load = (args: IArgs) => new AppModel(args).load();

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    this.client = args.client;
    this.uri = Uri.row(args.uri);
  }

  /**
   * [Fields]
   */
  private client: t.IClientTypesystem;
  private row: t.AppRow;

  public typename = 'App';
  public uri: t.IRowUri;
  public sheet: t.AppSheet;

  /**
   * [Properties]
   */
  public get props() {
    return this.row.props;
  }

  /**
   * [Methods]
   */
  public async load(): Promise<t.IAppModel> {
    const client = this.client;
    const uri = this.uri;
    const { row, sheet } = await load({ uri, client, typename: 'App' });
    this.sheet = sheet;
    this.row = row;
    return this;
  }

  public toString() {
    return this.uri.toString();
  }

  public toObject() {
    return this.row.toObject();
  }
}
