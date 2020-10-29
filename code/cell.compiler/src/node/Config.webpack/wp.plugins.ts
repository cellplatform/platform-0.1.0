import * as t from './types';
import * as env from './wp.plugin.env';
import * as federation from './wp.plugin.federation';
import * as html from './wp.plugin.html';
import * as typeChecker from './wp.plugin.typeChecker';

type P = NonNullable<t.WpConfig['plugins']>;

export const Plugins = {
  init(args: t.IArgs): P {
    return [
      Plugins.federation(args),
      Plugins.typeChecker(args),
      Plugins.html(args),
      Plugins.env(args),
    ].filter(Boolean);
  },

  html: html.init,
  federation: federation.init,
  typeChecker: typeChecker.init,
  env: env.init,
};
