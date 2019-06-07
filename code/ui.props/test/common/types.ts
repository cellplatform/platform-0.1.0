import { t } from './libs';
import { Subject } from 'rxjs';

export * from '@platform/cli.ui/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  next(state: Partial<ITestState>): void
};

export type ITestState = {
  theme?: t.PropsTheme;
  data?: object | any[];
};
