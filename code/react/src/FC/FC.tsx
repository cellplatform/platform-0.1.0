import React from 'react';

type O = Record<string, unknown>;

/**
 * Helpers for working with `React.FC` (aka. "functional components").
 */
export const FC = {
  decorate<P, F extends O>(
    View: React.FC<P>,
    fields: F,
    options: { displayName?: string } = {},
  ): React.FC<P> & F {
    const { displayName } = options;
    if (displayName) View.displayName = displayName;
    Object.keys(fields).forEach((key) => (View[key] = fields[key]));
    return View as React.FC<P> & F;
  },
};
