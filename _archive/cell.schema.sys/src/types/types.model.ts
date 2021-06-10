import * as t from '../common/types';

type ILoadArgs = { client: t.IClientTypesystem; uri: string | t.IRowUri };
type Model<M extends IModel> = {
  load(args: ILoadArgs): Promise<M>;
};

/**
 * App
 */
export type AppModel = Model<IAppModel>;
export type AppWindowModel = Model<IAppWindowModel>;

type IModel = {
  readonly typename: string;
  readonly uri: t.IRowUri;
  readonly sheet: t.AppSheet;
  toString(): string;
};

export type IAppModel = IModel & {
  readonly props: t.ITypedSheetRowProps<t.App>;
  load(): Promise<IAppModel>;
  toObject(): t.App;
};

export type IAppWindowModel = IModel & {
  readonly props: t.ITypedSheetRowProps<t.AppWindow>;
  readonly app: t.IAppModel;
  load(): Promise<IAppWindowModel>;
  toObject(): t.AppWindow;
};
