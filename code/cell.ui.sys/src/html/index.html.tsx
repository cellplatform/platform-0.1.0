import '../config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { Root } from '../components/Root';
import { AppBuilder } from '../components/AppBuilder';
import { Debug } from '../components/Debug';
import { context } from '../context';

function render(entry?: string) {
  if (entry === 'entry:debug') {
    return (
      <Root title={'system.debug'}>
        <Debug />
      </Root>
    );
  } else {
    // Default or 'entry:builder'
    return (
      <Root>
        <AppBuilder />
      </Root>
    );
  }
}

(async () => {
  const win = (window as unknown) as t.ITopWindow;
  const { Provider, ctx } = await context.create({ env: win.env });

  const entry = ctx.window.props.argv.find((arg) => arg.startsWith('entry:'));
  const el = render(entry);
  const root = <Provider>{el}</Provider>;

  ReactDOM.render(root, document.getElementById('root'));
})();
