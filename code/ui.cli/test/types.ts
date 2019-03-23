import { ICommand, ICommandArgs } from '../src/types';

export { ILog } from '@platform/log';

export * from '../src/types';

export type ITestCommandLine = {
  invoke(args: ITestCommandLineInvokeArgs): any;
};

export type ITestCommandLineInvokeArgs = {
  command: ICommand<ITestCommandProps>;
  args: ICommandArgs;
};

export type ITestCommandProps = {};
