import { t } from './common';

/**
 * Environment parameter.
 */
export type DevEnv = {
  ns: string; // TEMP 🐷

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
export type DevActionBooleanHandler<C> = (ctx: C, env: t.DevEnvBoolean) => boolean; // Return the state of the switch.
export type DevEnvBoolean = t.DevEnv & { change: boolean };
