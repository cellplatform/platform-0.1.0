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
export type ActionComponentHandler<C> = (e: t.ActionComponentHandlerProps<C>) => JSX.Element | null;
export type ActionComponentHandlerProps<C> = {
  ctx: C;
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
  el?: JSX.Element | null;
};
