import React from 'react';

import { EventStackCard } from '../EventStack.Card';
import { EventStackCardFactory } from './types';

export const cardFactory: EventStackCardFactory = (args) => {
  return (
    <EventStackCard
      key={args.id}
      count={args.count}
      event={args.event}
      width={args.width}
      isTopCard={args.isTopCard}
      showPayload={args.showPayload}
      onShowPayloadToggle={args.toggleShowPayload}
    />
  );
};
