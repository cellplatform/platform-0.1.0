import { Subject } from 'rxjs';

export * from '@platform/cli.ui/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
};

export type ITestState = {
  src?: string;
  size?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: number | string;
  backgroundColor?: number | string;
  placeholderIconColor?: number | string;
};
