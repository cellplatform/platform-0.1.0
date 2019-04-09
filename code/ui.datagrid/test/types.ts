import { Subject } from 'rxjs';

export * from '../src/types';
export * from '@platform/ui.cli/lib/types';

export type ITestCommandProps = {
  state$: Subject<Partial<ITestState>>;
};

export type TestViewType = 'grid' | 'editor' | 'foo';
export type TestEditorType = 'debug' | 'default';
export type ITestState = {
  view?: TestViewType;
  editor?: TestEditorType;
  el?: React.ReactNode;
};
