import * as t from './types';

export const KIND = 'Webpack';

const DATA: t.WebpackData = { config: {} };
const CONFIG: t.WebpackConfigData = { name: '', mode: 'production' };

export const DEFAULT = { DATA, CONFIG };
