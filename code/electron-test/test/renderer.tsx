import '@babel/polyfill';
import '../node_modules/@uiharness/dev/css/normalize.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from '../src/components';
import { renderer } from '../src/common';
import { IContext } from '@platform/electron';

const res = renderer.init();
const { ipc, log, store } = res;

const Context = React.createContext<IContext>({} as any);
Context.displayName = 'ElectronContext';

// Context.

export class App extends React.PureComponent {
  public render() {
    return (
      <Context.Provider value={{ ipc, log, store }}>
        <Child />
      </Context.Provider>
    );
  }
}

export class Child extends React.PureComponent {
  public static contextType = Context;
  public render() {
    return (
      <div>
        Child
        <GrandChild />
      </div>
    );
  }
}

export class GrandChild extends React.PureComponent {
  public static contextType = Context;
  public context!: React.ContextType<typeof Context>;

  public render() {
    console.log('this.props', this.props);
    console.log('this.context', this.context);
    const { log } = this.context;
    log.info('hello');

    return (
      <div>
        <Context.Consumer>
          {value => {
            return <div>consumer: {Boolean(value.log)}</div>;
          }}
        </Context.Consumer>
      </div>
    );
  }
}

/**
 * Render page.
 */
try {
  const el = <Test />;
  // const el = <App />;
  ReactDOM.render(el, document.getElementById('root'));
} catch (error) {
  log.error('Load failed: ', error.message);
}
