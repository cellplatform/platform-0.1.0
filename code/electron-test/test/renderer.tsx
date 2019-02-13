import '../node_modules/@uiharness/dev/css/normalize.css';
import '@babel/polyfill';

import * as React from 'react';
import renderer from '@platform/electron/lib/renderer';
// import { Test } from '../src/components';

export class Child extends React.PureComponent {
  public static contextType = renderer.Context;
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
  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

  public render() {
    const { log } = this.context;
    log.info('hello');
    return (
      <div>
        <renderer.Context.Consumer>
          {value => {
            return <div>consumer: {Boolean(value.log).toString()}</div>;
          }}
        </renderer.Context.Consumer>
      </div>
    );
  }
}

/**
 * Render page.
 */
// const el = <Test />;
const el = <Child />;
renderer.render(el, 'root').then(context => {
  console.log('renderer loaded:', context); // tslint:disable-line
});
