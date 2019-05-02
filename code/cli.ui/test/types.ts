import { Subject } from 'rxjs';

import { ICommandShellProps } from '../src';

export { ILog } from '@platform/log';
export * from '../src/types';

export type ITestCommandProps = {
  state$: Subject<ITestState>;
  next(state: ITestState): void;
};

export type ITestState = {
  commandShell?: ICommandShellProps;
};
