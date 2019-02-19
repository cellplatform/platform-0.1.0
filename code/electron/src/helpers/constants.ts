import { IWindowTag } from './types';

/**
 * Keys used for storing values on the global (window) object.
 *
 *    DO NOT TOUCH THESE - unless you know what you're doing.
 *
 */
export const GLOBAL = {
  STORE_CLIENT: '@platform/STORE/CLIENT',

  IPC_CHANNEL: '@platform/IPC',
  IPC_CLIENT: '@platform/IPC/CLIENT',
  IPC_HANDLERS: '@platform/IPC/HANDLERS',

  IPC: {
    ID: {
      REQUEST: '@platform/IPC/ID/request',
      RESPONSE: '@platform/IPC/ID/response',
    },
  },
};

/**
 * Window tags
 */
export const TAG_DEV_TOOLS: IWindowTag = { tag: 'type', value: 'DEV_TOOLS' };
