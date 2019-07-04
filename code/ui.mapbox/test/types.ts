import { Subject } from 'rxjs';

import * as t from '../src/types';

export * from '@platform/cli.ui/lib/types';
export * from '../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type ITestState = {
  center?: t.ILngLat;
  zoom?: number;
};
