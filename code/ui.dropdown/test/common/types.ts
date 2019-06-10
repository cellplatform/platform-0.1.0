import { Subject } from 'rxjs';

export * from '@platform/cli.ui/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type ITestState = {
  title?: string;
  count?: number;
};
