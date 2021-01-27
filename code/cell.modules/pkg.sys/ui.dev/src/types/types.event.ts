import { t } from './common';

/**
 * Common event-bus for the Dev namespace.
 */
export type DevEventBus = t.EventBus<t.DevEvent>;

/**
 * All events within the Dev namespace.
 */
export type DevEvent = t.DevActionEvent;
