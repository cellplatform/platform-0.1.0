import React from 'react';
import * as ReactDOM from 'react-dom';

import { Is } from './common';

const ID = 'sys.ui.primitives.spinner';

export const RenderStyleOnce = (): React.ReactPortal | null => {
  return Is.browser
    ? document.head
      ? ReactDOM.createPortal(<SpinnerStyle />, document.head)
      : null
    : null;
};

/**
 * See:
 *    https://spin.js.org/
 *    http://spin.js.org/spin.css
 */
export const SpinnerStyle = () => {
  return (
    <style id={ID}>
      {`
@keyframes spinner-line-fade-more {
0%, 100% {
opacity: 0; /* minimum opacity */
}
1% {
opacity: 1;
}
}

@keyframes spinner-line-fade-quick {
0%, 39%, 100% {
opacity: 0.25; /* minimum opacity */
}
40% {
opacity: 1;
}
}

@keyframes spinner-line-fade-default {
0%, 100% {
opacity: 0.22; /* minimum opacity */
}
1% {
opacity: 1;
}
}
`}
    </style>
  );
};
