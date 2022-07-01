import React, { useState } from 'react';

import { css, CssValue, t, FC, LoadMask, DEFAULT, ErrorBoundary } from './common';
import { Loader } from './view/Loader';
import { Info } from './view/Info';
import { ModuleApp } from '../Module.App';

import { ModuleView as View, ModuleProps } from './Module.View';

export { ModuleProps };

/**
 * Export
 */

type Fields = {
  LoadMask: typeof LoadMask;
  DEFAULT: typeof DEFAULT;
  App: typeof ModuleApp;
};
export const Module = FC.decorate<ModuleProps, Fields>(
  View,
  { DEFAULT, LoadMask, App: ModuleApp },
  { displayName: 'Module' },
);
