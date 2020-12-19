import { bundle } from '../common';
import { monaco } from '@monaco-editor/react';

export * from './configure.language';
export * from './configure.prettier';
export * from './configure.theme';
export * from './util';

/**
 * Set the CDN path to load worker JS assets from.
 * See:
 *    https://github.com/suren-atoyan/monaco-react#config
 *    https://microsoft.github.io/monaco-editor/api
 */
monaco.config({
  paths: {
    vs: bundle.path(`/static/vs`),
  },
});
