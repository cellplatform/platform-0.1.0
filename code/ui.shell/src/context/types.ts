import * as t from '../common/types';

export type IShellContext = {
  loader: t.ILoader;
  shell: t.IShellState;
  splash: t.ISplash;
  theme: t.ShellTheme;
};
