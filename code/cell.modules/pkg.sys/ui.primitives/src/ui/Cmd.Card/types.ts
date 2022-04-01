import * as t from '../../common/types';

type Id = string;
type Milliseconds = number;

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

export type CmdCardStateMutator = (prev: CmdCardState) => Promise<void>;

/**
 * EVENTS (API)
 */
export type CmdCardEventsFactory = (args: CmdCardEventsFactoryArgs) => CmdCardEvents;
export type CmdCardEventsFactoryArgs = {
  instance: CmdCardInstance;
  dispose$?: t.Observable<any>;
};
export type CmdCardEvents = t.Disposable & {
  instance: { bus: Id; id: Id };
  $: t.Observable<t.CmdCardEvent>;
  state: {
    req$: t.Observable<CmdCardStateReq>;
    res$: t.Observable<CmdCardStateRes>;
    patch$: t.Observable<CmdCardStatePatch>;
    get(options?: { timeout?: Milliseconds }): Promise<CmdCardStateRes>;
    mutate(handler: CmdCardStateMutator): Promise<void>;
  };
};

/**
 * EVENT Definitions
 */
export type CmdCardEvent = CmdCardStateReqEvent | CmdCardStateResEvent | CmdCardStatePatchEvent;

/**
 * Retrieve the current state.
 */
export type CmdCardStateReqEvent = {
  type: 'sys.ui.CmdCard/state:req';
  payload: CmdCardStateReq;
};
export type CmdCardStateReq = { instance: Id; tx: Id };

export type CmdCardStateResEvent = {
  type: 'sys.ui.CmdCard/state:res';
  payload: CmdCardStateRes;
};
export type CmdCardStateRes = { instance: Id; tx: Id; state?: CmdCardState; error?: string };

/**
 * Mutate state (immutably)
 */
export type CmdCardStatePatchEvent = {
  type: 'sys.ui.CmdCard/state:patch';
  payload: CmdCardStatePatch;
};
export type CmdCardStatePatch = { instance: Id; op: t.StateChangeOperation; patches: t.PatchSet };
