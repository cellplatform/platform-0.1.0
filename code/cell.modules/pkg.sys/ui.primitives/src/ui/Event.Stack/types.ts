import { EventHistoryItem } from '../Event/types';

export type EventStackCardFactory = (args: EventStackCardFactoryArgs) => JSX.Element;
export type EventStackCardFactoryArgs = EventHistoryItem & {
  title?: string;
  width: number;
  isTopCard: boolean;
  showPayload?: boolean;
  toggleShowPayload?: () => void;
};
