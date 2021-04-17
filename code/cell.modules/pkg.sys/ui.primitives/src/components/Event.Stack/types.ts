import { EventHistoryItem } from '../Event/types';

export type EventStackCardFactory = (args: EventStackCardFactoryArgs) => JSX.Element;
export type EventStackCardFactoryArgs = EventHistoryItem & {
  width: number;
  isTopCard: boolean;
  showPayload?: boolean;
  toggleShowPayload?: () => void;
};
