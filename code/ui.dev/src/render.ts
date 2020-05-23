import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { reset } from '@platform/css';

/**
 * Renders an element into the DOM.
 */
export function render(
  element: React.ReactElement,
  container?: Element | null | string,
  callback?: () => void,
) {
  reset(); // Normalise CSS.
  container = container || 'root';
  container = typeof container === 'string' ? document.getElementById(container) : container;
  ReactDOM.render(element, container, callback);
}
