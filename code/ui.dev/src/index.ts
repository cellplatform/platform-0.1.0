import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { reset } from '@platform/css';

export { log } from '@platform/log/lib/client';
export { value, time } from '@platform/util.value';
export { color, css, CssValue } from '@platform/css';

export { Foo } from '@platform/react';
export { ObjectView, IObjectViewProps } from '@platform/ui.object';

/**
 * Renders an element into the DOM.
 */
export function render(
  element: React.SFCElement<any> | Array<React.SFCElement<any>>,
  container?: Element | DocumentFragment | null | string,
  callback?: () => void,
) {
  reset(); // Normalise CSS.
  container = container || 'root';
  container = typeof container === 'string' ? document.getElementById(container) : container;
  ReactDOM.render(element, container, callback);
}
