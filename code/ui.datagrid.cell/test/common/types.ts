import { Subject } from 'rxjs';
import { CellEditorView } from './libs';

export * from '@platform/ui.cli/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  editorViews: CellEditorView[];
};

export type ITestState = {};
