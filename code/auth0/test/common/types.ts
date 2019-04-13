import { Subject } from 'rxjs';
import { WebAuth } from '../../src';

export * from '@platform/ui.cli/lib/types';
export * from '../../src/types';

export type ITestCommandProps = {
  state$: Subject<ITestState>;
  auth: WebAuth;
};

export type ITestState = {
  data?: any;
};
