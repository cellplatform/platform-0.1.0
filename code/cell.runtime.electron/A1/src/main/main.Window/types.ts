import { BrowserWindow } from 'electron';

import * as t from '../common/types';

export type WindowRef = {
  id: t.WindowId;
  uri: t.ProcessWindowUri;
  browser: BrowserWindow;
};
