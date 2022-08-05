import * as t from './types';
import * as env from './wp.plugin.env';
import * as federation from './wp.plugin.federation';
import * as html from './wp.plugin.html';
import * as typeChecker from './wp.plugin.typeChecker';
import * as subResourceIntegrity from './wp.plugin.subResourceIntegrity';

type P = NonNullable<t.WpConfig['plugins']>;

export const Plugins = {
  init(args: t.PluginArgs): P {
    return [
      Plugins.federation(args),
      Plugins.typeChecker(args),
      Plugins.html(args),
      Plugins.env(args),
      Plugins.subResourceIntegrity(args),
    ].filter(Boolean);
  },

  env: env.init,
  html: html.init,
  federation: federation.init,
  typeChecker: typeChecker.init,
  subResourceIntegrity: subResourceIntegrity.init,
};
