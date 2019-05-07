import * as React from 'react';
import { Subject } from 'rxjs';
import { IObservableProps } from '@platform/util.value';
import { graphql } from '../../src';
import * as t from '../../src/types';

export { IObservableProps };
export * from '@platform/cli.ui/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  next(state: ITestState): void;
  threadCommentProps: IObservableProps<IThreadCommentTestProps>;
  threadStore: t.IThreadStore;
  graphql: graphql.ConversationGraphql;
};

export type ITestState = {
  el?: React.ReactNode;
};

export type IThreadCommentTestProps = {
  name?: string;
  body?: string;
  isEditing: boolean;
};
