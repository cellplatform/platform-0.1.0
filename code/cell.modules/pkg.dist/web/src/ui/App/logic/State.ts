import { AppController as Controller } from './Controller';
import { AppEvents as Events } from './Events';
import { t, Event } from '../common';

const useEvents = (instance: t.AppInstance) => {
  return Event.useEventsRef<t.AppEvents>(() => Events({ instance }));
};

export const State = {
  Events,
  Controller,
  useEvents,
};
