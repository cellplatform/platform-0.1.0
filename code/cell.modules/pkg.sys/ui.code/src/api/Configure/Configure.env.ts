import { loader } from '@monaco-editor/react';
import { log } from '../common';
import { staticPaths } from './Configure.paths';

/**
 * Configure the environment.
 */
export async function env(args: { staticRoot?: string }) {
  /**
   * Set the CDN path to load worker JS assets from.
   *
   * See:
   *    https://github.com/suren-atoyan/monaco-react#config
   *    https://microsoft.github.io/monaco-editor/api
   *
   */
  const isDefault = !Boolean(args.staticRoot);
  const paths = staticPaths(args.staticRoot);
  const vs = paths.vs;

  loader.config({
    paths: { vs },
  });

  log.info(`(🌳) configuring code-editor environment: ${isDefault ? '(using defaults)' : ''}`);
  if (isDefault) log.info('     using [defaults]');
  log.info(` ●   static "vs" worker-process and assets path: "${vs}"`);
  log.info(` ●          types.d path (ecmascript):           "${paths.types.es}"`);
  log.info(` ●          types.d path (cell):                 "${paths.types.sys}"`);
}
