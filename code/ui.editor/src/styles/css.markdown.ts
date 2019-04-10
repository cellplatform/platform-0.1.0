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
    marginBottom: '0.4em',
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
  'ul, ol': {
    margin: 0,
    padding: 0,
    paddingLeft: '1.2em',
    marginBottom: '1em',
  },
  ol: {
    paddingLeft: '1.25em',
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
  code: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  pre: {
    fontSize: '0.85em',
    color: color.format(-0.8),
    backgroundColor: color.format(-0.03),
    border: `solid 1px ${color.format(-0.05)}`,
    borderRadius: 2,
    padding: '1em',
    paddingTop: '1.1em',
    marginTop: '1.4em',
    marginBottom: '1.8em',
  },
  'p code': {
    fontSize: '0.85em',
    color: '#C80100', // Dark red.
    backgroundColor: color.format(-0.03),
    border: `solid 1px ${color.format(-0.05)}`,
    padding: '0.05em 0.25em',
    borderRadius: 3,
    top: '-0.1em',
    position: 'relative',
  },
};
