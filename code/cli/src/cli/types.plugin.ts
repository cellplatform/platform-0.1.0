import { Observable } from 'rxjs';
import * as t from '../common/types';

export type CmdPluginsInit = (cli: t.ICmdPlugins) => void;

/**
 * CLI Plugins
 */

export type ICmdPlugins = {
  events$: Observable<t.CmdAppEvent>;
  exit: t.CmdAppExit;
  commands: ICmdPlugin[];
  command<T extends object = {}>(cmd: ICmdPluginArgs<T>): ICmdPluginResponse;
};

export type ICmdPluginArgs<T extends object = {}> = {
  name: string;
  description: string;
  alias?: string;
  handler: CmdPluginHandler<T>;
};
export type ICmdPlugin = ICmdPluginArgs & {
  options: Array<ICmdPluginOption<any>>;
};

export type CmdPluginHandler<A extends object = {}> = (
  args: ICmdPluginHandlerArgs<A>,
) => Promise<any>;
export type ICmdPluginHandlerArgs<A extends object = {}> = {
  argv: A;
  events$: Observable<t.CmdAppEvent>;
  exit: t.CmdAppExit;
  keyboard: t.ICmdKeyboard;
};

export type ICmdPluginResponse = ICmdPlugin & {
  option<T extends keyof ICmdPluginType>(args: ICmdPluginOption<T>): ICmdPluginResponse;
};

export type ICmdPluginOption<T extends keyof ICmdPluginType> = {
  name: string;
  description: string;
  alias?: string;
  type: T;
  default: ICmdPluginType[T];
};

export type ICmdPluginType = {
  boolean: boolean;
  string: string;
  number: number;
};
