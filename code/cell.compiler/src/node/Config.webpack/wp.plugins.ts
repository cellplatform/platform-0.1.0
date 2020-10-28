import { IArgs, t } from './common';
import * as envVariables from './wp.plugin.envVariables';
import * as federation from './wp.plugin.federation';
import * as html from './wp.plugin.html';
import * as typeChecker from './wp.plugin.typeChecker';

type P = NonNullable<t.WpConfig['plugins']>;

export const Plugins = {
  init(args: IArgs): P {
    return [
      Plugins.federation(args),
      Plugins.typeChecker(args),
      Plugins.html(args),
      Plugins.envVariables(args),
    ].filter(Boolean);
  },

  html: html.init,
  federation: federation.init,
  typeChecker: typeChecker.init,
  envVariables: envVariables.init,
};
