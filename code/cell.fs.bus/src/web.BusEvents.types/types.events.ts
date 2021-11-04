import { SysFsIoEvent } from './types.events.io';
import { SysFsIndexEvent } from './types.events.indexer';
import { SysFsCellEvent } from './types.events.cell';
import { SysFsChangedEvent } from './types.events.change';
import { SysFsInfoReqEvent, SysFsInfoResEvent } from './types.events.info';

/**
 * EVENTS
 */
export type SysFsEvent =
  | SysFsIoEvent
  | SysFsIndexEvent
  | SysFsCellEvent
  | SysFsInfoReqEvent
  | SysFsInfoResEvent
  | SysFsChangedEvent;
