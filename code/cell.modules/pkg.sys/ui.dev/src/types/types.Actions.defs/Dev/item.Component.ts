import { t } from '../../common';

type O = Record<string, unknown>;

/**
 * INPUT: A general purpose JSX <Element>.
 */
export type ActionComponent = {
  id: string;
  kind: 'dev/component';
  handler?: t.ActionComponentHandler<any>;
};

/**
 * HANDLER Component
 */
export type ActionComponentHandler<C> = (e: t.ActionComponentHandlerArgs<C>) => JSX.Element | null;
export type ActionComponentHandlerArgs<C> = {
  ctx: C;
  env: Required<t.ActionsModelEnvProps>;
  change: ActionComponentChange<C>;
};

export type ActionComponentChange<C> = {
  ctx(fn: (draft: C) => void): ActionComponentHandlerArgs<C>;
  settings: t.ActionHandlerSettings<ActionComponentHandlerArgs<C>>;
};

/**
 * EVENT: Fires for the Component.
 */
export type IActionComponentRenderEvent = {
  type: 'sys.ui.dev/action/Component/render';
  payload: IActionComponentRenderPayload;
};
export type IActionComponentRenderPayload = {
  namespace: string;
  item: t.ActionComponent;
  element?: JSX.Element | null;
};
