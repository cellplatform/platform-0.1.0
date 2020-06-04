import { Subject } from 'rxjs';

export * from '../../common/types';

export type ITestCommandProps = {
  state$: Subject<Partial<ITestState>>;
};

export type TestEditorType = 'debug' | 'default';
export type ITestState = {
  editor?: TestEditorType;
};
