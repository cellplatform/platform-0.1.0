import { GLOBAL } from '../constants';
import { IpcHandlerRef, IpcHandlerRefs } from './types';

const g = global as any;

/**
 * Read/write helpers for writing to the global object.
 *
 * NOTE:
 *    Isolated here as we should keep this kind of interaction
 *    with global to a minimum.
 */
export class Global {
  public static get handlerRefs(): IpcHandlerRefs {
    return g[GLOBAL.IPC_HANDLERS] || {};
  }
  public static set handlerRefs(refs: IpcHandlerRefs) {
    g[GLOBAL.IPC_HANDLERS] = refs;
  }

  public static setHandlerRef(ref: IpcHandlerRef) {
    const refs = { ...Global.handlerRefs, [ref.type]: ref };
    Global.handlerRefs = refs;
    return Global.handlerRefs;
  }
}
