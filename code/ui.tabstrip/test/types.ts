import { Subject } from 'rxjs';

export * from '@platform/cli.ui/lib/types';
export * from '../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type IMyData = { name: string };


export type ITestState = {
  isDraggable?: boolean;
  items?: IMyData[]
};
