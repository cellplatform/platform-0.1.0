import '@platform/polyfill';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Subject } from 'rxjs';

console.log('entry', 'hello world.');

console.log('Home react:', React.version);

// @ts-ignore
const Header = React.lazy(() => import('foo/Header'));

// @ts-ignore
const CodeEditor = React.lazy(() => import('code/CodeEditor'));

(async () => {
  const App = () => {
    const style = { fontFamily: 'sans-serif', WebkitAppRegion: 'drag' };
    return (
      <div style={style}>
        <h1>Hello World!</h1>
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 30,
            width: 500,
            height: 200,
            backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          }}
        >
          <React.Suspense fallback={<div />}>
            <Header />
            <CodeEditor />
          </React.Suspense>
        </div>
      </div>
    );
  };

  const root = document.body.appendChild(document.createElement('div'));
  ReactDOM.render(<App />, root);
})();

// type F = { count: number };
// const f: F = {};
// const foo = 123;

/**
 * Insert some UI
 */

const s = new Subject();
s.subscribe((e) => console.log('e > ', e));
Array.from({ length: 3 }).forEach((v, i) => s.next(i));
