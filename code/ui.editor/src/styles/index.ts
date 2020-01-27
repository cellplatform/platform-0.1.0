import { t, css, constants, style } from '../common';
import * as markdown from './markdown.css';

const CLASS = constants.CSS.CLASS;

function toPrefix(className?: string) {
  let prefix = `.${CLASS.EDITOR}`;
  prefix = className ? `${prefix}.${className}` : prefix;
  prefix = `${prefix} .ProseMirror`;
  return prefix;
}

/**
 * Initializes the given set of styles.
 */
export function init(args: { styles: Partial<t.IEditorStyles>; className?: string }) {
  const prefix = toPrefix(args.className);
  style.global(args.styles as t.IEditorStyles, { prefix });
}

/**
 * Insert `default global` styles.
 */
const prefix = toPrefix();
style.global({
  [prefix]: {
    outline: 'none',
    fontSize: '1em',
    whiteSpace: 'pre-wrap', // See: https://github.com/ProseMirror/prosemirror/issues/651#issuecomment-313436150
  },
});
style.global(markdown.styles, { prefix: `.${CLASS.MARKDOWN}` });
