import { t } from './common';

/**
 * Environment parameter.
 */
export type DevEnv = {
  readonly ns: string;

  // host: t.IDevHost;

  /**
   * TODO 🐷
   */
  // host: t.IDevHostedLayout;
  // layout: <mutable API for the [subject] layout>
  // item: Modify the item (eg: change the "label" of a button)
};

/**
 * Simple button handler.
 */
export type DevActionButtonHandler<C> = (ctx: C, env: DevEnv) => void;

/**
 * Boolean (switch) handler.
 */
export type DevActionBooleanHandler<C> = (e: t.DevActionBooleanHandlerArgs<C>) => boolean; // Return the state of the switch.
export type DevActionBooleanHandlerArgs<C> = {
  readonly ctx: C;
  change: boolean; // Flag indicating if the handler is being called because the value needs to change.
};
