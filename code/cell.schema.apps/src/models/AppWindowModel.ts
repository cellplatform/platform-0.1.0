import { t, Uri } from '../common';
import { load } from './util';
import { AppModel } from './AppModel';

type IArgs = {
  client: t.IClientTypesystem;
  uri: string | t.IRowUri;
};

export class AppWindowModel implements t.IAppWindowModel {
  public static load = (args: IArgs) => new AppWindowModel(args).load();

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
  private row: t.AppWindowRow;

  public typename = 'AppWindow';
  public uri: t.IRowUri;
  public sheet: t.AppSheet;
  public app: t.IAppModel;

  /**
   * [Properties]
   */
  public get props() {
    return this.row.props;
  }

  /**
   * [Methods]
   */
  public async load(): Promise<t.IAppWindowModel> {
    const client = this.client;
    const uri = this.uri;
    const { row, sheet } = await load({ uri, client, typename: 'AppWindow' });
    this.app = await AppModel.load({ client, uri: Uri.row(row.props.app) });
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
