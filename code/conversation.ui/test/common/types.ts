import * as React from 'react';
import { Subject } from 'rxjs';
import { IObservableProps } from '@platform/util.value';

export { IObservableProps };
export * from '@platform/cli.ui/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  next(state: ITestState): void;
  threadComment: IObservableProps<IThreadCommentTestProps>;
};

export type ITestState = {
  el?: React.ReactNode;
};

export type IThreadCommentTestProps = {
  name?: string;
  body?: string;
  isEditing: boolean;
};
