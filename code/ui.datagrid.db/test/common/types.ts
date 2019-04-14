import { Subject } from 'rxjs';
import * as t from '../../src/types';

export * from '@platform/ui.cli/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type ITestState = {
  count?: number;
  values?: t.IGridValues;
};
