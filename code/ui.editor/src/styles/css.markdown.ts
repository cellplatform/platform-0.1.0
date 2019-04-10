import { color, t } from '../common';

/**
 * Globally assigned styles for the ProseMirror editor content.
 */
export const styles: t.IEditorStyles = {
  'h1, h2, h3, h4, h5, h6': { margin: 0 }, // Reset
  h1: {},
  h2: {
    borderBottom: `solid 1px ${color.format(-0.1)}`,
    paddingBottom: '0.2em',
    marginBottom: '1em',
  },
  h3: {},
  h4: { textTransform: 'uppercase', color: color.format(-0.4) },
  h5: {},
  h6: {},
  p: { margin: 0, lineHeight: '1.5em' },
  hr: {
    border: 'none',
    borderBottom: `solid 5px`,
    borderColor: color.format(-0.1),
    marginTop: '1.8em',
    marginBottom: '1.8em',
  },
  pre: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: '0.8em',
    color: color.format(-0.8),
    backgroundColor: color.format(-0.03),
    border: `solid 1px ${color.format(-0.05)}`,
    padding: '1em',
    paddingTop: '1.1em',
    borderRadius: 2,
    marginTop: '1.4em',
    marginBottom: '1.8em',
  },
  ul: {
    margin: 0,
    padding: 0,
    paddingLeft: '1em',
  },
  blockquote: {
    borderLeft: `solid 5px ${color.format(-0.1)}`,
    margin: 0,
    marginTop: '1.5em',
    marginBottom: '1.5em',
    paddingLeft: '0.8em',
    paddingTop: '0.3em',
    paddingBottom: '0.3em',
    color: color.format(-0.6),
  },
};
