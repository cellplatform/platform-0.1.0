import '@babel/polyfill';
import '../node_modules/@uiharness/dev/css/normalize.css';
import * as React from 'react';
import { Test } from '../src/components';

import renderer from '@platform/electron/lib/renderer';

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
const el = <Child />;
renderer.render(el, 'root');
