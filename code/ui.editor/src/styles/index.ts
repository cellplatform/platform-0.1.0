import { t, css, constants } from '../common';
import * as markdown from './css.markdown';

const { CLASS_NAME: CSS_CLASS } = constants;

function toPrefix(className?: string) {
  let prefix = `.${CSS_CLASS.EDITOR}`;
  prefix = className ? `${prefix}.${className}` : prefix;
  prefix = `${prefix} .ProseMirror`;
  return prefix;
}

/**
 * Initializes the given set of styles.
 */
export function init(args: { styles: Partial<t.IEditorStyles>; className?: string }) {
  const prefix = toPrefix(args.className);
  css.global(args.styles as t.IEditorStyles, { prefix });
}

/**
 * Insert `default global` styles.
 */
const prefix = toPrefix();
css.global({ [prefix]: { outline: 'none', fontSize: '1em' } });
css.global(markdown.styles, { prefix: `.${CSS_CLASS.CONTENT_MARKDOWN}` });
