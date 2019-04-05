import { t, css, constants } from '../common';
import * as content from './styles.content';

/**
 * Initializes the given set of styles.
 */
export function init(args: { styles: Partial<t.IEditorStyles>; className?: string }) {
  const prefix = toPrefix(args.className);
  css.global(args.styles as t.IEditorStyles, { prefix });
}

/**
 * [Helpers]
 */
function toPrefix(className?: string) {
  let prefix = `.${constants.CSS_CLASS.EDITOR}`;
  prefix = className ? `${prefix}.${className}` : prefix;
  prefix = `${prefix} .ProseMirror`;
  return prefix;
}

/**
 * [Default]
 * Insert default global styles.
 */
const prefix = toPrefix();
css.global({ [prefix]: { outline: 'none' } });
css.global(content.styles, { prefix });
