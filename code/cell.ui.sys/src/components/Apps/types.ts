import { t } from '../../common';

export type IAppData = {
  uri: string;
  typename: string;
  props: t.App;
  types: t.ITypedSheetRowType[];
  windows: t.ITypedSheetData<t.AppWindow>;
};
