import { Subject } from 'rxjs';
import { WebAuth } from '../../src';

export * from '@platform/cli.ui/lib/types';
export * from '../../src/client/types';

export type ITestCommandProps = {
  state$: Subject<ITestState>;
  auth: WebAuth;
  updateState(): void;
};

export type ITestState = {
  data?: any;
};
