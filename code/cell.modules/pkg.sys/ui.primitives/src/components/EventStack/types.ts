import { t } from '../../common';

export type EventStackEvent = { id: string; event: t.Event; count: number };

export type EventStackCardFactory = (args: EventStackCardFactoryArgs) => JSX.Element;
export type EventStackCardFactoryArgs = EventStackEvent & {
  width: number;
  isTopCard: boolean;
  showPayload?: boolean;
  toggleShowPayload?: () => void;
};
