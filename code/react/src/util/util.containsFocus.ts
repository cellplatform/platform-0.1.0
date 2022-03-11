/* eslint-disable react/no-find-dom-node */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * 🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷
 *     DANGER - DO NOT USE
 *     Obsolete with React.FC (functional components)
 * 🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷🐷
 *
 * Determines whether any element within the child DOM hierarchy
 * is focused.
 */
export const containsFocus = (instance: React.ReactInstance) => {
  try {
    const el = ReactDOM.findDOMNode(instance);
    const active = document.activeElement;
    return el ? el.contains(active) : false;
  } catch (error: any) {
    // NB:  Will fail when call with unmounted `instance`.
    //      As an unmounted component by definition it does not contain focus.
    return false;
  }
};
