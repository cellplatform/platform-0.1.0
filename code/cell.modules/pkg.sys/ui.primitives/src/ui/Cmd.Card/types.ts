import * as t from '../../common/types';

type Id = string;

export type CmdCardInstance = { bus: t.EventBus<any>; id: Id };
export type CmdCardStateInfoFields = 'Title' | 'Version' | 'State' | 'State.Controller';

export type CmdCardRender = (props: CmdCardRenderProps) => JSX.Element | null;
export type CmdCardRenderProps = { size: t.DomRect };

/**
 * STATE
 */
export type CmdCardState = {
  commandbar: t.CmdBarState;
  body: {
    isOpen?: boolean; // TEMP 🐷
    render?: CmdCardRender;
    show?: 'FullScreen' | 'CommandBar' | 'Hidden';
  };
  backdrop: {
    render?: CmdCardRender;
  };
};

/**
 * EVENTS (API)
 */
export type CmdCardEventsFactory = (args: CmdCardEventsFactoryArgs) => CmdCardEvents;
export type CmdCardEventsFactoryArgs = {
  instance: CmdCardInstance;
  dispose$?: t.Observable<any>;
  initial?: t.CmdCardState | (() => t.CmdCardState);
};
export type CmdCardEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.CmdCardEvent>;
  state$: t.Observable<t.CmdCardState>;
  state: t.JsonState<CmdCardState>;
};

/**
 * EVENT (Definitions)
 */
export type CmdCardEvent = CmdCardStateChangedEvent;

/**
 * Retrieve the current state.
 */
export type CmdCardStateChangedEvent = {
  type: 'sys.ui.CmdCard/state:changed';
  payload: CmdCardStateChanged;
};
export type CmdCardStateChanged = {
  instance: Id;
  state: t.CmdCardState;
};
