import { color, t } from '../common';

/**
 * Globally assigned styles for the ProseMirror editor content.
 */
export const styles: t.IEditorStyles = {
  'h1, h2, h3, h4, h5, h6': {
    margin: 0,
  },
  'h1, h2': {
    borderBottom: `solid 1px ${color.format(-0.1)}`,
    paddingBottom: '0.2em',
    marginBottom: '0.8em',
  },
  'h3, h4, h5, h6': {
    marginBottom: '1em',
  },
  h1: { fontSize: '1.7em' },
  h2: { fontSize: '1.4em' },
  h3: { fontSize: '1.2em' },
  h4: { fontSize: '1em' },
  h5: { fontSize: '0.85em', textTransform: 'uppercase' },
  h6: { fontSize: '0.85em', textTransform: 'uppercase', color: color.format(-0.4) },
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
