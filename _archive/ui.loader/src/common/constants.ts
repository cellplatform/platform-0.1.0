export const COLORS = {
  WHITE: '#FFF',
  DARK: '#293042', // Inky blue/black.
};

/**
 * NOTE: Glamor CSS is not used here as it causes issued with server-side-rendering
 *       when referenced from other modules.  So for bootstrapping we do it old-school
 *       and then start using glamor again in the client.
 */
export const CSS = {
  ABSOLUTE: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  SCROLL: {
    overflowX: 'hidden',
    overflowY: 'scroll',
    WebkitOverflowScrolling: 'touch',
  },
  FLEX: {
    CENTER: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
};
