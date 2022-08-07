import * as t from './types';
import { init as env } from './wp.plugin.env';
import { init as federation } from './wp.plugin.federation';
import { init as html } from './wp.plugin.html';
import { init as subResourceIntegrity } from './wp.plugin.subResourceIntegrity';
import { init as typeChecker } from './wp.plugin.typeChecker';

type P = NonNullable<t.WpConfig['plugins']>;

export const Plugins = {
  init(args: t.PluginArgs): P {
    return [
      Plugins.subResourceIntegrity(args),
      Plugins.federation(args),
      Plugins.typeChecker(args),
      Plugins.html(args),
      Plugins.env(args),
    ].filter(Boolean);
  },

  env,
  html,
  federation,
  typeChecker,
  subResourceIntegrity,
};
