import { Subject } from 'rxjs';

export * from '@platform/cli.ui/lib/types';
export * from '../../types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type ITestState = {
  isEnabled?: boolean;
  isChecked?: boolean;
};
