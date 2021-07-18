import { ConfigFile } from './ConfigFile';
import { Genesis as Base } from '../../data';
import { IHttpClient } from './types';

/**
 * Wrapper around abstract [HTTP] Genesis function that
 * knows how to read in the root URI from the config-file.
 */
export function Genesis(http: IHttpClient) {
  return Base(http, async () => (await ConfigFile.read()).refs.genesis);
}
