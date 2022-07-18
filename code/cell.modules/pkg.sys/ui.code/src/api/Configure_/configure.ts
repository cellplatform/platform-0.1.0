import { loader } from '@monaco-editor/react';

import { registerLanguage } from './configure.language';
import { registerPrettier } from './configure.prettier';
import { defineThemes } from './configure.theme';
import { PATH, log } from '../common';

type StaticPathString = string;

let _isEnvInitialized = false;

/**
 * Code editor configuration setup.
 */
export const Configure = {
  registerLanguage,
  registerPrettier,
  defineThemes,

  /**
   * Global singleton initialize of the environment for the editor.
   */
  env(args: { vs?: StaticPathString }) {
    if (_isEnvInitialized) return;
    _isEnvInitialized = true;

    /**
     * Set the CDN path to load worker JS assets from.
     * See:
     *    https://github.com/suren-atoyan/monaco-react#config
     *    https://microsoft.github.io/monaco-editor/api
     */
    const vs = args.vs ?? PATH.STATIC.VS;

    log.info(`configuring code-editor environment:`);
    log.info(`  static "vs" worker process path:`, vs);

    loader.config({ paths: { vs } });
  },
};
