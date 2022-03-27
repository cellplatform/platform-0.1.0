import * as t from '../../common/types';

type Id = string;

export type CmdCardStateInfoFields = 'Module' | 'Module.Name' | 'Module.Version';

export type CmdCardBusArgs = { bus: t.EventBus<any>; instance: Id };

export type CmdCardRender = (props: CmdCardRenderProps) => JSX.Element | null;
export type CmdCardRenderProps = { size: t.DomRect };

/**
 * STATE
 */
export type CmdCardState = {
  bus: t.EventBus<any>;
  isOpen?: boolean;
  tmp: number; // TEMP 🐷
};

/**
 * EVENTS (API)
 */
export type CmdCardEventsFactory = (args: { bus: t.EventBus<any>; instance: Id }) => CmdCardEvents;
export type CmdCardEvents = t.Disposable & {
  bus: Id;
  instance: Id;
};

/**
 * EVENT Definitions
 */
export type CmdCardEvent = CmdCardFooEvent;

export type CmdCardFooEvent = {
  type: 'sys.ui.CmdCard/FOO/PLACEHOLDER'; // TEMP 🐷
  payload: CmdCardFoo;
};
export type CmdCardFoo = {
  instance: Id;
};
