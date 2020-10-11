import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

console.log('entry', 'hello world.');

(async () => {
  // class Foo {
  //   public static count = 123;
  // }
  // new Foo();

  // @ts-ignore
  const f = import('foo/Header');

  f.then((e) => {
    console.log('e', e.foo());
  });
})();

/**
 * Insert some UI
 */
const App = () => {
  return <h1 style={{ fontFamily: 'sans-serif' }}>Hello World!</h1>;
};

const within = document.body.appendChild(document.createElement('div'));
ReactDOM.render(<App />, within);
