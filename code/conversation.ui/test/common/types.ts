import * as React from 'react';
import { Subject } from 'rxjs';
import { IObservableProps } from '@platform/util.value';
import { data } from '../../src';
import * as t from '../../src/types';

export { IObservableProps };
export * from '@platform/cli.ui/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  next(state: ITestState): void;
  threadCommentProps: IObservableProps<IThreadCommentTestProps>;
  threadStore: t.IThreadStore;
  graphql: data.ConversationGraphql;
};

export type ITestState = {
  el?: React.ReactNode;
};

export type IThreadCommentTestProps = {
  person?: t.IUserIdentity;
  body?: string;
  isEditing: boolean;
};
