import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';
// import { css, CssValue, t } from '../../common';

// import { css } from '@platform/css';

// import * as R from 'ramda';
// import * as tinycolor from 'tinycolor2';
// const jss = require('glamor-jss');

export const App = () => {
  // console.log('R', R);
  // console.log('tinycolor', tinycolor);
  // console.log('jss', jss);
  // console.log('css', css);

  // const styles = {
  //   base: css({
  //     fontSize: 50,
  //   }),
  // };
  // return <div {...styles.base}>Hello</div>;
  return <div>Bar</div>;
};

const root = document.createElement('div');
document.body.append(root);
ReactDOM.render(<App />, root);

const foobar = () => {
  return new Promise((resolve, reject) => {
    resolve();
  });
};
const tmp = async () => {
  await foobar();
  console.log('title', 123);
};
tmp();
