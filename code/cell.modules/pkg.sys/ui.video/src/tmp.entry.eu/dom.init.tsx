import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Harness } from 'sys.ui.dev';

const imports = {
  SlugEditor: import('../ui/SlugEditor/dev/DEV'),
};

const ns = 'ui.SlugEditor';
export const DevHarness: React.FC = () => <Harness actions={Object.values(imports)} initial={ns} />;

const el = <DevHarness />;
ReactDOM.render(el, document.getElementById('root'));
