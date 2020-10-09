import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

console.log('entry', ': hello');
console.log('');
console.log('React', React);
console.log('-------------------------------------------');

(async () => {
  class Foo {
    public static count = 123;
  }
  new Foo();

  if (typeof window === 'object') {
    // document.body.innerHTML = `<h1>Hello World!</h1>`;
  }

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
