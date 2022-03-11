import React from 'react';

import { EventStackCardFactory } from './types';

import { EventCard } from '../Event.Card';

export const cardFactory: EventStackCardFactory = (args) => {
  return (
    <EventCard
      key={args.id}
      title={args.title}
      count={args.count}
      event={args.event}
      width={args.width}
      isTopCard={args.isTopCard}
      showPayload={args.showPayload}
      onShowPayloadToggle={args.toggleShowPayload}
    />
  );
};
