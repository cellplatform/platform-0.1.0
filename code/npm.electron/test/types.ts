import { Subject } from 'rxjs';
import { Npm } from '../src/renderer';

export * from '../src/types';
export * from '@platform/cli.spec/lib/types';

export type ITestCommandProps = {
  state$: Subject<Partial<ITestState>>;
  npm: Npm;
};

export type ITestState = {};
