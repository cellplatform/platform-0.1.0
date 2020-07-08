import '../config';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { t } from '../common';
import { AppBuilder } from '../components/AppBuilder';
import { context } from '../context';

(async () => {
  const win = (window as unknown) as t.ITopWindow;
  const { Provider } = await context.create({ env: win.env });

  const el = (
    <Provider>
      <AppBuilder />
    </Provider>
  );

  ReactDOM.render(el, document.getElementById('root'));
})();
