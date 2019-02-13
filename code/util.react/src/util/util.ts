import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * Determines whether any element within the child DOM hierarchy
 * is focused.
 */
export function containsFocus(instance: React.ReactInstance) {
  try {
    const el = ReactDOM.findDOMNode(instance);
    const active = document.activeElement;
    return el ? el.contains(active) : false;
  } catch (error) {
    // NB:  Will fail when call with unmounted `instance`.
    //      As an unmounted component by definition it does not contain focus.
    return false;
  }
}
