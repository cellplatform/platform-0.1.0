/**
 * Model for controlling the <Shell>.
 */
export type IShellState = {
  body: IShellBodyState;
  aside: IShellAsideState;
};

export type IShellBodyState = {
  el?: JSX.Element;
};

export type IShellAsideState = {
  el?: JSX.Element;
};
