import React from 'react';

type O = Record<string, unknown>;

/**
 * Helpers for working with `React.FC` (aka. "functional components").
 */
export const FC = {
  decorate<P, F extends O>(View: React.FC<P>, fields: F): React.FC<P> & F {
    Object.keys(fields).forEach((key) => (View[key] = fields[key]));
    return View as React.FC<P> & F;
  },
};
