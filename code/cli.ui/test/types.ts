import * as React from 'react';
import { Subject } from 'rxjs';

import { t } from './common';

export { ILog } from '@platform/log';
export * from '../src/types';

export type ITestCommandProps = {
  state$: Subject<ITestState>;
  state: ITestState;
  next(state: ITestState): void;
};

export type ITestState = {
  el?: React.ReactNode;
  tree?: t.ICommandShellTreeOptions;
};
