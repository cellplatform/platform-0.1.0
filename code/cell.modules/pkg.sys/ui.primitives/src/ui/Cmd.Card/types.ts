import { Disposable, EventBus, DomRect } from '@platform/types';

type Id = string;

export type CmdCardRender = (props: CmdCardRenderProps) => JSX.Element | null;
export type CmdCardRenderProps = { size: DomRect };

/**
 * EVENTS (API)
 */
export type CmdCardEventsFactory = (args: { bus: EventBus<any>; instance: Id }) => CmdCardEvents;
export type CmdCardEvents = Disposable & {
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
