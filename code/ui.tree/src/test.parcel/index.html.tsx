import * as React from 'react';
import { render } from '@platform/ui.dev';

const test = {
  Component: import('./components/Test.Component'),
  State: import('./components/Test.State'),
  Columns: import('./components/Test.Columns'),
};

type M = { Test: React.FunctionComponent };
const key = window.location.search.trim().replace(/^\?/, '');
const module = test[key];

if (module) {
  module.then((e: M) => render(React.createElement(e.Test)));
  document.title = `${document.title} - ${key}`;
}
