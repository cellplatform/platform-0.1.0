import { t } from './common';

export * from './types.events.record';
export * from './types.events.stream';
export * from './types.events.streams';

/**
 * EVENTS
 */
export type MediaEvent = t.MediaStreamEvent | t.MediaStreamsEvent | t.MediaStreamRecordEvent;
