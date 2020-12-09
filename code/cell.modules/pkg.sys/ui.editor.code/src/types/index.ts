export * from '../types.monaco';
import * as t from '../types.monaco';

/**
 * The singleton instance of the Monaco API.
 */
export type IMonacoSingleton = {
  monaco: t.IMonaco;
};
