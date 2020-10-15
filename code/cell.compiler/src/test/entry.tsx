import '@platform/polyfill';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Subject } from 'rxjs';

console.log('entry', 'hello world.');

console.log('Home react:', React.version);

// @ts-ignore
const CodeEditor = React.lazy(() => import('foo/CodeEditor'));

(async () => {
  class Foo {
    public static count = 123;
  }
  new Foo();

  // @ts-ignore
  const f = import('foo/Header');
  f.then((e) => console.log('e', e.foo()));

  // @ts-ignore
  // const ide = await import('foo/CodeEditor');
  // console.log('ide', ide);

  // const CodeEditor = ide.CodeEditor;
  // console.log('f1', CodeEditor);

  console.log('CodeEditor', CodeEditor);

  const App = () => {
    const style = { fontFamily: 'sans-serif', WebkitAppRegion: 'drag' };
    return (
      <div style={style}>
        <h1>Hello World!..</h1>
        <div
          style={{
            position: 'absolute',
            top: 100,
            left: 30,
            width: 500,
            height: 450,
            backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
          }}
        >
          <React.Suspense fallback={<div />}>
            {/* <Header /> */}
            <CodeEditor />
          </React.Suspense>
        </div>
      </div>
    );
  };

  const within = document.body.appendChild(document.createElement('div'));
  ReactDOM.render(<App />, within);
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
