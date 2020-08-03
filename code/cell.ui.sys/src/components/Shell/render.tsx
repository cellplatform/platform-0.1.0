import * as React from 'react';
import { t } from '../../common';
import { TestPanelSelected } from './TestPanelSelected';

export const renderer: t.ModuleRender = (args) => {
  // if (args.view) {

  // }

  // args.data.
  return <TestPanelSelected module={args.module} />;
};
