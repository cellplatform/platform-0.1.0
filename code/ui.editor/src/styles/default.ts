import { color, t } from '../common';

/**
 * Globally assigned styles for the ProseMirror editor.
 */
export const defaultStyles: t.IEditorStyles = {
  h1: { margin: 0 },
  h2: {},
  h3: {},
  h4: { textTransform: 'uppercase', color: color.format(-0.4) },
  h5: {},
  h6: {},
  p: { margin: 0, lineHeight: '1.5em' },
  hr: {
    border: 'none',
    borderBottom: `solid 5px`,
    borderColor: color.format(-0.1),
    marginTop: 20,
    marginBottom: 20,
  },
  pre: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
    color: color.format(-0.8),
    backgroundColor: color.format(-0.03),
    border: `solid 1px ${color.format(-0.05)}`,
    padding: 10,
    paddingTop: 12,
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 25,
  },
  ul: {
    margin: 0,
    padding: 0,
    paddingLeft: 25,
  },
  blockquote: {
    borderLeft: `solid 5px ${color.format(-0.1)}`,
    margin: 0,
    marginTop: '1.5em',
    marginBottom: '1.5em',
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4,
    color: color.format(-0.6),
  },
};
