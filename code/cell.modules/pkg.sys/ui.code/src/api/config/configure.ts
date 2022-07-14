import { loader } from '@monaco-editor/react';

export * from './configure.language';
export * from './configure.prettier';
export * from './configure.theme';

/**
 * Set the CDN path to load worker JS assets from.
 * See:
 *    https://github.com/suren-atoyan/monaco-react#config
 *    https://microsoft.github.io/monaco-editor/api
 */
loader.config({
  paths: { vs: `static/vs` },
});
