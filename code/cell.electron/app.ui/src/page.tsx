import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { css } from '@platform/react';

import './styles/global';

console.log('👋');
console.log('👋   Hello World!');
console.log('👋');

const url =
  'https://dev.db.team/cell:ck6bmume4000008mqhkkdaebj!A2/file/dist/index.html?def=ns:ck6h33tit000008mt36b74r2v';

const styles = {
  base: css({
    Absolute: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    padding: 10,
  }),
  // iframe: css({
  //   Absolute: 0,
  //   width: '100%',
  //   height: '100%',
  //   border: 'none',
  // }),
};

const el = (
  <div {...styles.base}>
    {/* <iframe src={url} {...styles.iframe} /> */}
    Hello World
  </div>
);

/**
 * Render root React element.
 */
ReactDOM.render(el, document.getElementById('root'));
