import { monaco } from '@monaco-editor/react';
import { t } from '../../common';

import { language } from './configure.language';
import { theme } from './configure.theme';
export { language, theme };

/**
 * Initializes the Monaco code editor.
 */
export async function init() {
  const editor = (await monaco.init()) as t.IMonaco;
  theme(editor);
  language(editor);
  return { editor };
}
