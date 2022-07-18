import { loader } from '@monaco-editor/react';

import { registerLanguage } from './Configure.language';
import { registerPrettier } from './Configure.prettier';
import { defineThemes } from './Configure.theme';
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
    loader.config({ paths: { vs } });

    log.info(`configuring code-editor environment:`);
    log.info(`  static "vs" worker-process and assets path:`, vs);
  },
};
