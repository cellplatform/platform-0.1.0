import '../config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { context } from '../context';
import { render } from './render';

import { testHarnessInit } from '../components.dev/module.Harness/.dev/test.init';

(async () => {
  const win = (window as unknown) as t.ITopWindow;
  const { Provider, ctx } = await context.create({ env: win.env });

  const entry = ctx.window.props.argv.find((arg) => arg.startsWith('entry:'));
  const el = render(entry || '');
  const root = <Provider>{el}</Provider>;

  ReactDOM.render(root, document.getElementById('root'));

  /**
   * TODO 🐷
   * - temp / remove
   * - Simulate module insertion into UIHarness.
   */

  if (entry === 'entry:harness') {
    testHarnessInit(ctx);
  }
})();
