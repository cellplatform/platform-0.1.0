import { rx, id, defaultValue, value, time } from '@platform/util.value';
export { rx, id, defaultValue, value, time };

import { Module, Builder } from '@platform/cell.module';
export { Module, Builder };

import { StateObject } from '@platform/state';
export { StateObject };

import * as jpath from 'jsonpath';
export { jpath };

import { sortBy, prop } from 'ramda';
export const R = { sortBy, prop };

/* eslint-disable */
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
export { ModuleFederationPlugin };
/* eslint-enable */
