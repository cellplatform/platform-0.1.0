import * as t from '../common/types';

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
