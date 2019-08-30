import * as t from '../common/types';

/**
 * Model for controlling the <Shell>.
 */
export type IShell = {
  body: IShellBody;
  aside: IShellAside;
};

export type IShellBody = {
  el?: JSX.Element;
};

export type IShellAside = { el?: JSX.Element };
