import '../config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { context } from '../context';
import { render } from './render';

import { SAMPLE } from './SAMPLE';

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
   */
  if (entry === 'entry:harness') {
    SAMPLE(ctx.bus.type());
  }
})();
