import { t } from './common';

/**
 * The context object passed down through a React component hierarchy.
 */
export type IAppContext = t.IEnvContext<t.AppEvent> & {
  window: t.IAppWindowModel;
  sheetChanged: (changes: t.ITypedSheetChanges) => Promise<t.ITypedSheetLoaded>;
  getState(): t.IAppState;
};
