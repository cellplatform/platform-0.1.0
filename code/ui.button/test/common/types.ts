import { Subject } from 'rxjs';

export * from '@platform/ui.cli/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type ITestState = {
  isEnabled?: boolean;
};
