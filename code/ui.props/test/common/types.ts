import { t } from './libs';
import { Subject } from 'rxjs';

export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  next(state: Partial<ITestState>): void;
};

export type ITestState = {
  theme?: t.PropsTheme;
  data?: object | any[];
  isInsertable?: boolean;
  isDeletable?: boolean;
};
