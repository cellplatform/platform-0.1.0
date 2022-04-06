import * as t from '../../common/types';

type Id = string;

export type ModuleCardInstance = t.CmdCardInstance;

/**
 * State
 */
export type ModuleCardState = {
  card: t.CmdCardState;
};

/**
 * EVENTS (API)
 */
export type ModuleCardEventsFactory = (args: ModuleCardEventsFactoryArgs) => ModuleCardEvents;
export type ModuleCardEventsFactoryArgs = {
  instance: ModuleCardInstance;
  dispose$?: t.Observable<any>;
  initial?: t.ModuleCardState | (() => t.ModuleCardState);
};
export type ModuleCardEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  // $: t.Observable<t.ModuleCardEvent>;
  // state$: t.Observable<t.ModuleCardState>;
  // state: t.JsonState<ModuleCardState>;
};

/**
 * EVENT (Definitions)
 */
export type ModuleCardEvent = t.CmdCardEvent;
